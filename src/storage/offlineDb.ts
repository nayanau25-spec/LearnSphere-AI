import {openDB, type DBSchema, type IDBPDatabase} from 'idb';
import type {
  AssessmentAttempt,
  Language,
  Lesson,
  StudentProfile,
  SyncEvent,
  TextScale,
} from '../domain/types';

export interface CachedLessonRecord {
  lessonId: string;
  lesson: Lesson;
  cachedAt: string;
  sizeBytes: number;
}

export interface SyncMetaRecord {
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  totalSyncedEvents: number;
}

export interface UserPrefsRecord {
  language: Language;
  textScale: TextScale;
  simulateOffline: boolean;
  lite3d: boolean;
}

interface LearnSphereDB extends DBSchema {
  cached_lessons: {
    key: string;
    value: CachedLessonRecord;
  };
  attempts: {
    key: string;
    value: AssessmentAttempt;
    indexes: {'by-student': string};
  };
  sync_queue: {
    key: string;
    value: SyncEvent;
  };
  meta: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'learnsphere-offline-v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LearnSphereDB>> | null = null;

function getDb(): Promise<IDBPDatabase<LearnSphereDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LearnSphereDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cached_lessons')) {
          db.createObjectStore('cached_lessons', {keyPath: 'lessonId'});
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const attemptsStore = db.createObjectStore('attempts', {
            keyPath: 'id',
          });
          attemptsStore.createIndex('by-student', 'studentId');
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', {keyPath: 'eventId'});
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_DEMO_STUDENT_PROFILE: StudentProfile = {
  id: 'demo-student-asha',
  name: 'Asha Kumari',
  grade: 7,
  schoolName: 'Govt. Higher Primary School, Mandya (Demo)',
  points: 120,
  streakDays: 4,
  dailyGoalMinutes: 20,
  todayMinutes: 8,
  completedLessonIds: [],
  earnedBadgeIds: [],
  isDemoUser: true,
};

export const DEFAULT_USER_PREFS: UserPrefsRecord = {
  language: 'en',
  textScale: 'md',
  simulateOffline: false,
  lite3d: false,
};

export async function getCachedLessons(): Promise<CachedLessonRecord[]> {
  const db = await getDb();
  return db.getAll('cached_lessons');
}

export async function saveLessonOffline(
  lesson: Lesson,
): Promise<CachedLessonRecord> {
  const db = await getDb();
  const serialized = JSON.stringify(lesson);
  const record: CachedLessonRecord = {
    lessonId: lesson.id,
    lesson,
    cachedAt: new Date().toISOString(),
    sizeBytes: new Blob([serialized]).size,
  };
  await db.put('cached_lessons', record);
  return record;
}

export async function removeLessonOffline(lessonId: string): Promise<void> {
  const db = await getDb();
  await db.delete('cached_lessons', lessonId);
}

export async function getLocalAttempts(
  studentId: string,
): Promise<AssessmentAttempt[]> {
  const db = await getDb();
  const list = await db.getAllFromIndex('attempts', 'by-student', studentId);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveAttemptLocally(
  attempt: AssessmentAttempt,
): Promise<void> {
  const db = await getDb();
  await db.put('attempts', attempt);
}

export async function replaceLocalAttempts(
  studentId: string,
  attempts: AssessmentAttempt[],
): Promise<void> {
  const db = await getDb();
  const existing = await db.getAllFromIndex('attempts', 'by-student', studentId);
  const tx = db.transaction('attempts', 'readwrite');
  for (const item of existing) {
    await tx.store.delete(item.id);
  }
  for (const attempt of attempts) {
    await tx.store.put(attempt);
  }
  await tx.done;
}

export async function getPendingSyncQueue(): Promise<SyncEvent[]> {
  const db = await getDb();
  const items = await db.getAll('sync_queue');
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function enqueueSyncEvent(event: SyncEvent): Promise<void> {
  const db = await getDb();
  await db.put('sync_queue', event);
}

export async function replaceSyncQueue(events: SyncEvent[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sync_queue', 'readwrite');
  await tx.store.clear();
  for (const evt of events) {
    await tx.store.put(evt);
  }
  await tx.done;
}

export async function getSyncMeta(): Promise<SyncMetaRecord> {
  const db = await getDb();
  const raw = (await db.get('meta', 'sync_meta')) as SyncMetaRecord | undefined;
  return (
    raw ?? {
      lastSyncedAt: null,
      lastSyncError: null,
      totalSyncedEvents: 0,
    }
  );
}

export async function updateSyncMeta(
  patch: Partial<SyncMetaRecord>,
): Promise<SyncMetaRecord> {
  const db = await getDb();
  const current = await getSyncMeta();
  const next: SyncMetaRecord = {...current, ...patch};
  await db.put('meta', next, 'sync_meta');
  return next;
}

export async function getLocalProfile(): Promise<StudentProfile> {
  const db = await getDb();
  const profile = (await db.get('meta', 'student_profile')) as
    | StudentProfile
    | undefined;
  if (!profile) {
    await db.put('meta', DEFAULT_DEMO_STUDENT_PROFILE, 'student_profile');
    return DEFAULT_DEMO_STUDENT_PROFILE;
  }
  return profile;
}

export async function saveLocalProfile(
  profile: StudentProfile,
): Promise<StudentProfile> {
  const db = await getDb();
  await db.put('meta', profile, 'student_profile');
  return profile;
}

export async function getUserPrefs(): Promise<UserPrefsRecord> {
  const db = await getDb();
  const prefs = (await db.get('meta', 'user_prefs')) as
    | UserPrefsRecord
    | undefined;
  return prefs ? {...DEFAULT_USER_PREFS, ...prefs} : DEFAULT_USER_PREFS;
}

export async function saveUserPrefs(
  prefs: UserPrefsRecord,
): Promise<UserPrefsRecord> {
  const db = await getDb();
  await db.put('meta', prefs, 'user_prefs');
  return prefs;
}

export async function resetDemoLocalStorageOnly(
  demoStudentId: string,
): Promise<void> {
  const db = await getDb();
  // Remove only demo student's attempts and pending demo sync events
  const allAttempts = await db.getAllFromIndex(
    'attempts',
    'by-student',
    demoStudentId,
  );
  const attTx = db.transaction('attempts', 'readwrite');
  for (const att of allAttempts) {
    await attTx.store.delete(att.id);
  }
  await attTx.done;

  const allQueue = await db.getAll('sync_queue');
  const queueTx = db.transaction('sync_queue', 'readwrite');
  for (const evt of allQueue) {
    if (evt.studentId === demoStudentId) {
      await queueTx.store.delete(evt.eventId);
    }
  }
  await queueTx.done;

  await db.put('meta', DEFAULT_DEMO_STUDENT_PROFILE, 'student_profile');
  await db.put(
    'meta',
    {lastSyncedAt: null, lastSyncError: null, totalSyncedEvents: 0},
    'sync_meta',
  );
}
