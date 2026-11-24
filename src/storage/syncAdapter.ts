import {dedupeSyncEvents, partitionSyncResult} from '../domain/syncLogic';
import type {SyncEvent} from '../domain/types';
import {
  getPendingSyncQueue,
  getSyncMeta,
  replaceSyncQueue,
  updateSyncMeta,
  type SyncMetaRecord,
} from './offlineDb';

export interface SyncRunOutcome {
  ok: boolean;
  syncedCount: number;
  skippedDuplicates: number;
  remainingPending: number;
  error?: string;
  meta: SyncMetaRecord;
}

/**
 * Isolated Sync Adapter connecting IndexedDB sync_queue to the Express SQLite REST API.
 * Enforces idempotent eventId deduplication and leaves unsynced events safely in IndexedDB
 * whenever offline or on transient network failures.
 */
export async function flushSyncQueue(
  isEffectiveOnline: boolean,
): Promise<SyncRunOutcome> {
  const rawQueue = await getPendingSyncQueue();
  const queue = dedupeSyncEvents(rawQueue);
  const currentMeta = await getSyncMeta();

  if (queue.length === 0) {
    return {
      ok: true,
      syncedCount: 0,
      skippedDuplicates: 0,
      remainingPending: 0,
      meta: currentMeta,
    };
  }

  if (!isEffectiveOnline) {
    const meta = await updateSyncMeta({
      lastSyncError:
        'Device is offline. Events remain queued safely in IndexedDB.',
    });
    return {
      ok: false,
      syncedCount: 0,
      skippedDuplicates: 0,
      remainingPending: queue.length,
      error: 'Device is offline',
      meta,
    };
  }

  // Mark pending items as syncing
  const syncingQueue: SyncEvent[] = queue.map((e) => ({
    ...e,
    status: 'syncing',
  }));
  await replaceSyncQueue(syncingQueue);

  try {
    const response = await fetch('/api/sync/events', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({events: syncingQueue}),
    });

    if (!response.ok) {
      const errBody = await response
        .json()
        .catch(() => ({error: `HTTP ${response.status}`}));
      throw new Error(errBody.error || `Sync failed with ${response.status}`);
    }

    const result = (await response.json()) as {
      syncedIds: string[];
      skippedDuplicateIds: string[];
      serverTimestamp: string;
    };

    const acceptedIds = [
      ...(result.syncedIds ?? []),
      ...(result.skippedDuplicateIds ?? []),
    ];
    const {remainingQueue, syncedCount} = partitionSyncResult(
      syncingQueue,
      acceptedIds,
      [],
    );
    await replaceSyncQueue(remainingQueue);

    const nextMeta = await updateSyncMeta({
      lastSyncedAt: result.serverTimestamp ?? new Date().toISOString(),
      lastSyncError: null,
      totalSyncedEvents:
        currentMeta.totalSyncedEvents + (result.syncedIds?.length ?? 0),
    });

    return {
      ok: true,
      syncedCount,
      skippedDuplicates: result.skippedDuplicateIds?.length ?? 0,
      remainingPending: remainingQueue.length,
      meta: nextMeta,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unable to reach sync server.';
    const failedIds = syncingQueue.map((e) => e.eventId);
    const {remainingQueue} = partitionSyncResult(
      syncingQueue,
      [],
      failedIds,
      message,
    );
    await replaceSyncQueue(remainingQueue);
    const nextMeta = await updateSyncMeta({lastSyncError: message});
    return {
      ok: false,
      syncedCount: 0,
      skippedDuplicates: 0,
      remainingPending: remainingQueue.length,
      error: message,
      meta: nextMeta,
    };
  }
}
