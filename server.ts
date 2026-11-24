import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import {z} from 'zod';
import {
  db,
  getAllAssignments,
  getAllAttempts,
  getAllStudents,
  getAssignmentsForStudent,
  getAttemptsForStudent,
  getStudentProfileById,
  initDatabase,
  resetDemoStudentInDb,
} from './src/server/db.ts';
import {askGeminiTutor, isGeminiConfigured} from './src/server/tutor.ts';
import {SAMPLE_QUESTIONS} from './src/domain/curriculum.ts';
import {computeTopicMasteryMap} from './src/domain/adaptiveEngine.ts';
import type {AssessmentAttempt, StudentProfile} from './src/domain/types.ts';

initDatabase();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json({limit: '1mb'}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: isGeminiConfigured(),
    storage: 'sqlite',
    timestamp: new Date().toISOString(),
  });
});

// Clearly labelled demo role login (no real passwords or PII)
const DemoLoginSchema = z.object({
  role: z.enum(['student', 'teacher']),
});

app.post('/api/auth/demo-login', (req, res) => {
  const parsed = DemoLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({error: 'Invalid role selection.'});
    return;
  }

  const role = parsed.data.role;
  const sessionToken = `demo-${role}-session`;
  res.json({
    ok: true,
    role,
    sessionToken,
    isDemoAuth: true,
    user:
      role === 'student'
        ? getStudentProfileById('demo-student-asha')
        : {
            id: 'demo-teacher-meera',
            name: 'Meera Deshmukh (Demo Teacher)',
            schoolName: 'Govt. Higher Primary School, Mandya (Demo)',
          },
  });
});

// Student hydration endpoint
app.get('/api/student/:studentId/state', (req, res) => {
  const studentId = req.params.studentId;
  const profile = getStudentProfileById(studentId);
  if (!profile) {
    res.status(404).json({error: 'Student not found.'});
    return;
  }
  const attempts = getAttemptsForStudent(studentId);
  const assignments = getAssignmentsForStudent(studentId);
  res.json({
    profile,
    attempts,
    assignments,
    serverTimestamp: new Date().toISOString(),
  });
});

// Idempotent offline-to-online sync endpoint
const SyncEventSchema = z.object({
  eventId: z.string().min(3),
  studentId: z.string().min(1),
  type: z.enum([
    'ASSESSMENT_COMPLETED',
    'LESSON_PROGRESS',
    'PROFILE_UPDATED',
  ]),
  createdAt: z.string(),
  payload: z.record(z.string(), z.unknown()),
});

const SyncBatchSchema = z.object({
  events: z.array(SyncEventSchema).max(100),
});

app.post('/api/sync/events', (req, res) => {
  const parsed = SyncBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid sync event payload.',
      details: parsed.error.flatten(),
    });
    return;
  }

  const syncedIds: string[] = [];
  const skippedDuplicateIds: string[] = [];
  const now = new Date().toISOString();

  const checkEventStmt = db.prepare(
    'SELECT event_id FROM sync_events WHERE event_id = ?',
  );
  const insertEventStmt = db.prepare(`
    INSERT INTO sync_events (event_id, student_id, event_type, payload_json, created_at, synced_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertAttemptStmt = db.prepare(`
    INSERT OR IGNORE INTO assessment_attempts (
      id, student_id, subject, grade, mode, topic_filter,
      answers_json, score_percent, correct_count, total_count,
      created_at, saved_offline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const evt of parsed.data.events) {
      const existing = checkEventStmt.get(evt.eventId) as
        | {event_id: string}
        | undefined;
      if (existing) {
        skippedDuplicateIds.push(evt.eventId);
        continue;
      }

      insertEventStmt.run(
        evt.eventId,
        evt.studentId,
        evt.type,
        JSON.stringify(evt.payload),
        evt.createdAt,
        now,
      );

      if (evt.type === 'ASSESSMENT_COMPLETED') {
        const attempt = evt.payload.attempt as AssessmentAttempt | undefined;
        if (attempt && attempt.id) {
          insertAttemptStmt.run(
            attempt.id,
            evt.studentId,
            attempt.subject,
            attempt.grade,
            attempt.mode,
            attempt.topicFilter ?? null,
            JSON.stringify(attempt.answers ?? []),
            attempt.scorePercent,
            attempt.correctCount,
            attempt.totalCount,
            attempt.createdAt,
            attempt.savedOffline ? 1 : 0,
          );
        }
      }

      if (
        evt.type === 'PROFILE_UPDATED' ||
        evt.type === 'LESSON_PROGRESS' ||
        evt.type === 'ASSESSMENT_COMPLETED'
      ) {
        const profile = evt.payload.profile as StudentProfile | undefined;
        if (profile && profile.id) {
          db.prepare(
            `
            UPDATE students
            SET grade = ?,
                points = ?,
                streak_days = ?,
                today_minutes = ?,
                completed_lesson_ids = ?,
                earned_badge_ids = ?,
                updated_at = ?
            WHERE id = ?
          `,
          ).run(
            profile.grade,
            profile.points,
            profile.streakDays,
            profile.todayMinutes,
            JSON.stringify(profile.completedLessonIds ?? []),
            JSON.stringify(profile.earnedBadgeIds ?? []),
            now,
            profile.id,
          );
        }
      }

      syncedIds.push(evt.eventId);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Database sync failure.',
    });
    return;
  }

  res.json({
    ok: true,
    syncedIds,
    skippedDuplicateIds,
    serverTimestamp: now,
  });
});

// Demo reset (only resets demo student record)
app.post('/api/student/reset-demo', (req, res) => {
  const studentId =
    typeof req.body?.studentId === 'string' &&
    req.body.studentId.startsWith('demo-')
      ? req.body.studentId
      : 'demo-student-asha';
  resetDemoStudentInDb(studentId);
  res.json({
    ok: true,
    profile: getStudentProfileById(studentId),
  });
});

// Teacher role guard middleware
function requireTeacherRole(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const roleHeader = req.header('x-user-role');
  if (roleHeader !== 'teacher') {
    res.status(403).json({
      error: 'Forbidden: Teacher role permission required for this endpoint.',
    });
    return;
  }
  next();
}

app.get('/api/teacher/classroom', requireTeacherRole, (_req, res) => {
  const students = getAllStudents();
  const attempts = getAllAttempts();
  const assignments = getAllAssignments();

  const studentSummaries = students.map((student) => {
    const sAttempts = attempts.filter((a) => a.studentId === student.id);
    const mastery = computeTopicMasteryMap(sAttempts, SAMPLE_QUESTIONS);
    const weakTopics = mastery.filter((m) => m.status === 'weak');
    const avgScore =
      sAttempts.length > 0
        ? Math.round(
            sAttempts.reduce((acc, a) => acc + a.scorePercent, 0) /
              sAttempts.length,
          )
        : null;

    return {
      student,
      attemptsCount: sAttempts.length,
      averageScore: avgScore,
      mastery,
      weakTopics,
      needsSupport:
        weakTopics.length > 0 || (avgScore !== null && avgScore < 60),
      recentAttempts: sAttempts.slice(0, 5),
    };
  });

  res.json({
    students: studentSummaries,
    assignments,
    totalSyncedEvents: (
      db.prepare('SELECT COUNT(*) AS count FROM sync_events').get() as {
        count: number;
      }
    ).count,
    serverTimestamp: new Date().toISOString(),
  });
});

const CreateAssignmentSchema = z.object({
  targetStudentId: z.string().min(1),
  subject: z.enum(['mathematics', 'science', 'english']),
  topicId: z.string().min(1),
  title: z.string().min(3).max(120),
  note: z.string().min(3).max(400),
});

app.post('/api/teacher/assignments', requireTeacherRole, (req, res) => {
  const parsed = CreateAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Please fill in a valid assignment title and instruction note.',
    });
    return;
  }

  const id = `assign_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO assignments (
      id, teacher_id, target_student_id, subject, topic_id,
      title, note, created_at, is_demo_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    'demo-teacher-meera',
    parsed.data.targetStudentId,
    parsed.data.subject,
    parsed.data.topicId,
    parsed.data.title.trim(),
    parsed.data.note.trim(),
    createdAt,
    0,
  );

  res.status(201).json({
    ok: true,
    assignment: {
      id,
      teacherId: 'demo-teacher-meera',
      ...parsed.data,
      createdAt,
      isDemoData: false,
    },
  });
});

// Server-side AI Tutor endpoint
const TutorRequestSchema = z.object({
  query: z.string().min(1).max(600),
  language: z.enum(['en', 'kn']).default('en'),
  topicName: z.string().optional(),
  grade: z.number().int().min(6).max(8).optional(),
  weakTopics: z.array(z.string()).optional(),
  mode: z.string().optional(),
});

app.post('/api/tutor/ask', async (req, res) => {
  const parsed = TutorRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({error: 'Please enter a valid question.'});
    return;
  }

  const result = await askGeminiTutor(parsed.data);
  res.json(result);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnSphere AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
