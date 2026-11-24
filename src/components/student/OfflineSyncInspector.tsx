import React from 'react';
import {
  Award,
  CheckCircle2,
  CloudOff,
  HardDrive,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import {ACHIEVEMENT_CATALOG} from '../../domain/curriculum';
import {COPY} from '../../domain/i18n';
import type {Language, SyncEvent} from '../../domain/types';
import type {CachedLessonRecord, SyncMetaRecord} from '../../storage/offlineDb';

interface Props {
  language: Language;
  isEffectiveOnline: boolean;
  simulateOffline: boolean;
  onToggleSimulateOffline: () => void;
  cachedLessons: CachedLessonRecord[];
  pendingQueue: SyncEvent[];
  syncMeta: SyncMetaRecord;
  syncing: boolean;
  onSyncNow: () => Promise<void>;
  earnedBadgeIds: string[];
}

export const OfflineSyncInspector: React.FC<Props> = ({
  language,
  isEffectiveOnline,
  simulateOffline,
  onToggleSimulateOffline,
  cachedLessons,
  pendingQueue,
  syncMeta,
  syncing,
  onSyncNow,
  earnedBadgeIds,
}) => {
  const t = COPY[language];

  const totalBytes = cachedLessons.reduce((acc, c) => acc + c.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* Live Continuity Demonstration Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Offline-First Storage & Synchronisation Queue
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Demonstrate the exact continuity loop: Go Offline → Study Cached
              Lesson → Save Quiz Locally → Restore Connection → Sync Events.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleSimulateOffline}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                simulateOffline
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {simulateOffline ? (
                <>
                  <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.goOnline}
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.simulateOffline}
                </>
              )}
            </button>

            <button
              type="button"
              disabled={syncing || pendingQueue.length === 0 || !isEffectiveOnline}
              onClick={() => void onSyncNow()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {syncing ? 'Syncing...' : `${t.syncNow} (${pendingQueue.length})`}
            </button>
          </div>
        </div>

        {/* 6-Stage Visual Pipeline */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5 text-xs sm:grid-cols-6">
          {[
            {label: '1. Online', active: isEffectiveOnline},
            {label: '2. Offline Mode', active: !isEffectiveOnline},
            {label: '3. Cached Study', active: cachedLessons.length > 0},
            {label: '4. Local IndexedDB', active: true},
            {
              label: '5. Reconnected',
              active: isEffectiveOnline && syncMeta.totalSyncedEvents > 0,
            },
            {
              label: '6. Server Synced',
              active: pendingQueue.length === 0 && syncMeta.totalSyncedEvents > 0,
            },
          ].map((stage, i) => (
            <div
              key={i}
              className={`rounded-lg border px-3 py-2.5 font-medium ${
                stage.active
                  ? 'border-blue-300 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {stage.label}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <span>
            Connection:{' '}
            <strong className="text-slate-900">
              {isEffectiveOnline ? t.onlineStatus : t.offlineStatus}
            </strong>
          </span>
          <span className="tabular-nums">
            {t.lastSynced}:{' '}
            <strong className="font-mono text-slate-900">
              {syncMeta.lastSyncedAt
                ? new Date(syncMeta.lastSyncedAt).toLocaleString()
                : t.neverSynced}
            </strong>
          </span>
          <span className="tabular-nums">
            Total Synced Events:{' '}
            <strong className="font-mono text-slate-900">
              {syncMeta.totalSyncedEvents}
            </strong>
          </span>
        </div>

        {syncMeta.lastSyncError && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
            Sync Notice: {syncMeta.lastSyncError}
          </div>
        )}
      </div>

      {/* IndexedDB Contents: Cached Lessons + Pending Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display flex items-center gap-2 text-base font-bold text-slate-900">
              <HardDrive className="h-4 w-4 text-blue-600" aria-hidden="true" />
              IndexedDB Cached Lessons
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {cachedLessons.length} saved ·{' '}
              {Math.round(totalBytes / 1024)} KB
            </span>
          </div>

          {cachedLessons.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No lessons downloaded yet. Open Offline Library and click Save
              Offline on any lesson.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {cachedLessons.map((rec) => (
                <li
                  key={rec.lessonId}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {rec.lesson.title[language]}
                    </p>
                    <p className="font-mono text-xs text-slate-500 tabular-nums">
                      Cached {new Date(rec.cachedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-emerald-700 tabular-nums">
                    {Math.max(1, Math.round(rec.sizeBytes / 1024))} KB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900">
              Pending Sync Event Queue
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {pendingQueue.length} queued
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>All local progress is synchronised with the server.</span>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 text-xs">
              {pendingQueue.map((evt) => (
                <li key={evt.eventId} className="py-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-slate-900">
                      {evt.type}
                    </span>
                    <span className="text-amber-700 uppercase">
                      {evt.status}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-slate-500 tabular-nums">
                    ID: {evt.eventId} · {new Date(evt.createdAt).toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Earned Achievement Badges */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-display flex items-center gap-2 text-base font-bold text-slate-900">
          <Award className="h-4 w-4 text-violet-600" aria-hidden="true" />
          Learning Milestones & Badges
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENT_CATALOG.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-lg border p-4 ${
                  earned
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <p className="text-xs font-semibold text-slate-500">
                  {earned ? 'Earned' : 'Locked'}
                </p>
                <h4 className="mt-1 text-sm font-bold text-slate-900">
                  {badge.title[language]}
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  {badge.description[language]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
