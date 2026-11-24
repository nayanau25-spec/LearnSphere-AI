import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRetryDelayMs,
  createSyncEvent,
  dedupeSyncEvents,
  partitionSyncResult,
} from './syncLogic';

test('dedupeSyncEvents prevents duplicate eventIds and keeps chronological order', () => {
  const e1 = createSyncEvent(
    'demo-student',
    'ASSESSMENT_COMPLETED',
    {score: 75},
    new Date('2026-11-24T10:00:00.000Z'),
  );
  const e2 = createSyncEvent(
    'demo-student',
    'LESSON_PROGRESS',
    {lessonId: 'lesson-math-fractions'},
    new Date('2026-11-24T09:50:00.000Z'),
  );
  const duplicateE1 = {...e1, retryCount: 2};

  const deduped = dedupeSyncEvents([e1, duplicateE1, e2]);
  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].eventId, e2.eventId);
  assert.equal(deduped[1].eventId, e1.eventId);
});

test('partitionSyncResult removes synced events and increments retryCount on failed events', () => {
  const e1 = createSyncEvent('s1', 'ASSESSMENT_COMPLETED', {});
  const e2 = createSyncEvent('s1', 'LESSON_PROGRESS', {});

  const {remainingQueue, syncedCount} = partitionSyncResult(
    [e1, e2],
    [e1.eventId],
    [e2.eventId],
    'Network timeout',
  );

  assert.equal(syncedCount, 1);
  assert.equal(remainingQueue.length, 1);
  assert.equal(remainingQueue[0].eventId, e2.eventId);
  assert.equal(remainingQueue[0].status, 'failed');
  assert.equal(remainingQueue[0].retryCount, 1);
  assert.equal(remainingQueue[0].lastError, 'Network timeout');
});

test('computeRetryDelayMs uses bounded exponential backoff', () => {
  assert.equal(computeRetryDelayMs(0), 1000);
  assert.equal(computeRetryDelayMs(2), 4000);
  assert.equal(computeRetryDelayMs(10), 32000);
});
