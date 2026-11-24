import type {SyncEvent, SyncEventType} from './types';

export function createSyncEvent(
  studentId: string,
  type: SyncEventType,
  payload: Record<string, unknown>,
  now: Date = new Date(),
): SyncEvent {
  const rand = Math.random().toString(36).slice(2, 8);
  return {
    eventId: `evt_${now.getTime()}_${rand}`,
    studentId,
    type,
    createdAt: now.toISOString(),
    payload,
    retryCount: 0,
    status: 'pending',
  };
}

/**
 * Prevents duplicate event submission by preserving only the first seen event
 * per unique eventId while maintaining chronological creation order.
 */
export function dedupeSyncEvents(events: SyncEvent[]): SyncEvent[] {
  const seen = new Set<string>();
  const unique: SyncEvent[] = [];
  const sorted = [...events].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  for (const evt of sorted) {
    if (!seen.has(evt.eventId)) {
      seen.add(evt.eventId);
      unique.push(evt);
    }
  }
  return unique;
}

export function computeRetryDelayMs(retryCount: number): number {
  const capped = Math.min(Math.max(retryCount, 0), 5);
  return 1000 * Math.pow(2, capped);
}

export function partitionSyncResult(
  queue: SyncEvent[],
  syncedIds: string[],
  failedIds: string[],
  errorMessage?: string,
): {
  remainingQueue: SyncEvent[];
  syncedCount: number;
} {
  const syncedSet = new Set(syncedIds);
  const failedSet = new Set(failedIds);

  const remainingQueue: SyncEvent[] = [];
  let syncedCount = 0;

  for (const evt of queue) {
    if (syncedSet.has(evt.eventId)) {
      syncedCount += 1;
      continue;
    }
    if (failedSet.has(evt.eventId)) {
      remainingQueue.push({
        ...evt,
        retryCount: evt.retryCount + 1,
        status: 'failed',
        lastError: errorMessage ?? 'Synchronisation failed; will retry.',
      });
    } else {
      remainingQueue.push(evt);
    }
  }

  return {remainingQueue, syncedCount};
}
