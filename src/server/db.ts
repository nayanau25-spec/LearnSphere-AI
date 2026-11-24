import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import type {
  AssessmentAttempt,
  StudentProfile,
  TeacherAssignment,
} from '../domain/types.ts';

const DB_PATH = path.resolve(process.cwd(), 'learnsphere.db');

export const db = new DatabaseSync(DB_PATH);

export function initDatabase(): void {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade INTEGER NOT NULL,
      school_name TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      streak_days INTEGER NOT NULL DEFAULT 1,
      daily_goal_minutes INTEGER NOT NULL DEFAULT 20,
      today_minutes INTEGER NOT NULL DEFAULT 0,
      completed_lesson_ids TEXT NOT NULL DEFAULT '[]',
      earned_badge_ids TEXT NOT NULL DEFAULT '[]',
      is_demo_user INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER NOT NULL,
      mode TEXT NOT NULL,
      topic_filter TEXT,
      answers_json TEXT NOT NULL,
      score_percent INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      saved_offline INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_events (
      event_id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      target_student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_demo_data INTEGER NOT NULL DEFAULT 1
    );
  `);

  seedInitialDemoData();
}

function seedInitialDemoData(): void {
  const existingCountRow = db
    .prepare('SELECT COUNT(*) AS count FROM students')
    .get() as {count: number};

  if (existingCountRow.count > 0) {
    return;
  }

  const now = new Date().toISOString();

  const insertStudent = db.prepare(`
    INSERT INTO students (
      id, name, grade, school_name, points, streak_days,
      daily_goal_minutes, today_minutes, completed_lesson_ids,
      earned_badge_ids, is_demo_user, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoStudents: Array<{
    id: string;
    name: string;
    grade: number;
    school: string;
    points: number;
    streak: number;
    today: number;
    completed: string[];
    badges: string[];
  }> = [
    {
      id: 'demo-student-asha',
      name: 'Asha Kumari',
      grade: 7,
      school: 'Govt. Higher Primary School, Mandya (Demo)',
      points: 120,
      streak: 4,
      today: 8,
      completed: [],
      badges: [],
    },
    {
      id: 'demo-student-ravi',
      name: 'Ravi Gowda (Demo Classmate)',
      grade: 7,
      school: 'Govt. Higher Primary School, Mandya (Demo)',
      points: 260,
      streak: 6,
      today: 20,
      completed: ['lesson-math-fractions', 'lesson-sci-plants'],
      badges: ['badge-first-diagnostic', 'badge-offline-ready'],
    },
    {
      id: 'demo-student-kavya',
      name: 'Kavya Nair (Demo Classmate)',
      grade: 7,
      school: 'Govt. Higher Primary School, Mandya (Demo)',
      points: 340,
      streak: 8,
      today: 25,
      completed: ['lesson-math-equations', 'lesson-eng-tenses'],
      badges: ['badge-first-diagnostic', 'badge-topic-master'],
    },
    {
      id: 'demo-student-darshan',
      name: 'Darshan Naik (Demo Classmate)',
      grade: 8,
      school: 'Govt. Higher Primary School, Mandya (Demo)',
      points: 145,
      streak: 2,
      today: 10,
      completed: [],
      badges: ['badge-first-diagnostic'],
    },
  ];

  for (const s of demoStudents) {
    insertStudent.run(
      s.id,
      s.name,
      s.grade,
      s.school,
      s.points,
      s.streak,
      20,
      s.today,
      JSON.stringify(s.completed),
      JSON.stringify(s.badges),
      1,
      now,
    );
  }

  // Seed realistic classroom assessment history for demo classmates (Asha starts fresh for live demo!)
  const insertAttempt = db.prepare(`
    INSERT INTO assessment_attempts (
      id, student_id, subject, grade, mode, topic_filter,
      answers_json, score_percent, correct_count, total_count,
      created_at, saved_offline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAttempt.run(
    'seed-att-ravi-1',
    'demo-student-ravi',
    'mathematics',
    7,
    'diagnostic',
    null,
    JSON.stringify([
      {
        questionId: 'q-math-frac-1',
        topicId: 'math-fractions',
        difficulty: 'beginner',
        selectedIndex: 0,
        correctIndex: 1,
        isCorrect: false,
      },
      {
        questionId: 'q-math-frac-2',
        topicId: 'math-fractions',
        difficulty: 'beginner',
        selectedIndex: 0,
        correctIndex: 0,
        isCorrect: true,
      },
      {
        questionId: 'q-math-eq-1',
        topicId: 'math-equations',
        difficulty: 'beginner',
        selectedIndex: 1,
        correctIndex: 1,
        isCorrect: true,
      },
      {
        questionId: 'q-math-geo-1',
        topicId: 'math-geometry',
        difficulty: 'beginner',
        selectedIndex: 1,
        correctIndex: 1,
        isCorrect: true,
      },
    ]),
    75,
    3,
    4,
    '2026-11-22T09:15:00.000Z',
    1,
  );

  insertAttempt.run(
    'seed-att-kavya-1',
    'demo-student-kavya',
    'science',
    7,
    'diagnostic',
    null,
    JSON.stringify([
      {
        questionId: 'q-sci-plant-1',
        topicId: 'sci-plants',
        difficulty: 'beginner',
        selectedIndex: 1,
        correctIndex: 1,
        isCorrect: true,
      },
      {
        questionId: 'q-sci-cir-1',
        topicId: 'sci-circuits',
        difficulty: 'beginner',
        selectedIndex: 2,
        correctIndex: 2,
        isCorrect: true,
      },
      {
        questionId: 'q-sci-mat-1',
        topicId: 'sci-matter',
        difficulty: 'beginner',
        selectedIndex: 2,
        correctIndex: 2,
        isCorrect: true,
      },
    ]),
    100,
    3,
    3,
    '2026-11-23T11:30:00.000Z',
    0,
  );

  insertAttempt.run(
    'seed-att-darshan-1',
    'demo-student-darshan',
    'mathematics',
    8,
    'diagnostic',
    null,
    JSON.stringify([
      {
        questionId: 'q-math-frac-1',
        topicId: 'math-fractions',
        difficulty: 'beginner',
        selectedIndex: 0,
        correctIndex: 1,
        isCorrect: false,
      },
      {
        questionId: 'q-math-frac-3',
        topicId: 'math-fractions',
        difficulty: 'intermediate',
        selectedIndex: 0,
        correctIndex: 2,
        isCorrect: false,
      },
      {
        questionId: 'q-math-eq-2',
        topicId: 'math-equations',
        difficulty: 'intermediate',
        selectedIndex: 0,
        correctIndex: 1,
        isCorrect: false,
      },
      {
        questionId: 'q-math-geo-1',
        topicId: 'math-geometry',
        difficulty: 'beginner',
        selectedIndex: 1,
        correctIndex: 1,
        isCorrect: true,
      },
    ]),
    25,
    1,
    4,
    '2026-11-23T14:20:00.000Z',
    1,
  );

  // Seed initial teacher assignment
  db.prepare(
    `
    INSERT INTO assignments (
      id, teacher_id, target_student_id, subject, topic_id,
      title, note, created_at, is_demo_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    'assign-seed-1',
    'demo-teacher-meera',
    'all',
    'mathematics',
    'math-fractions',
    'Fractions Foundation Check (Demo Assignment)',
    'Download the Fractions lesson before heading home and complete the 3-question beginner check.',
    now,
    1,
  );
}

export function getStudentProfileById(
  studentId: string,
): StudentProfile | null {
  const row = db
    .prepare('SELECT * FROM students WHERE id = ?')
    .get(studentId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapStudentRow(row);
}

export function getAllStudents(): StudentProfile[] {
  const rows = db
    .prepare('SELECT * FROM students ORDER BY name ASC')
    .all() as Array<Record<string, unknown>>;
  return rows.map(mapStudentRow);
}

export function getAttemptsForStudent(studentId: string): AssessmentAttempt[] {
  const rows = db
    .prepare(
      'SELECT * FROM assessment_attempts WHERE student_id = ? ORDER BY created_at DESC',
    )
    .all(studentId) as Array<Record<string, unknown>>;
  return rows.map(mapAttemptRow);
}

export function getAllAttempts(): AssessmentAttempt[] {
  const rows = db
    .prepare('SELECT * FROM assessment_attempts ORDER BY created_at DESC')
    .all() as Array<Record<string, unknown>>;
  return rows.map(mapAttemptRow);
}

export function getAssignmentsForStudent(
  studentId: string,
): TeacherAssignment[] {
  const rows = db
    .prepare(
      "SELECT * FROM assignments WHERE target_student_id = ? OR target_student_id = 'all' ORDER BY created_at DESC",
    )
    .all(studentId) as Array<Record<string, unknown>>;
  return rows.map(mapAssignmentRow);
}

export function getAllAssignments(): TeacherAssignment[] {
  const rows = db
    .prepare('SELECT * FROM assignments ORDER BY created_at DESC')
    .all() as Array<Record<string, unknown>>;
  return rows.map(mapAssignmentRow);
}

export function resetDemoStudentInDb(studentId: string): void {
  const now = new Date().toISOString();
  db.prepare('DELETE FROM assessment_attempts WHERE student_id = ?').run(
    studentId,
  );
  db.prepare('DELETE FROM sync_events WHERE student_id = ?').run(studentId);
  db.prepare(
    `
    UPDATE students
    SET points = 120,
        streak_days = 4,
        today_minutes = 8,
        completed_lesson_ids = '[]',
        earned_badge_ids = '[]',
        updated_at = ?
    WHERE id = ?
  `,
  ).run(now, studentId);
}

function mapStudentRow(row: Record<string, unknown>): StudentProfile {
  return {
    id: String(row.id),
    name: String(row.name),
    grade: Number(row.grade) as 6 | 7 | 8,
    schoolName: String(row.school_name),
    points: Number(row.points),
    streakDays: Number(row.streak_days),
    dailyGoalMinutes: Number(row.daily_goal_minutes),
    todayMinutes: Number(row.today_minutes),
    completedLessonIds: JSON.parse(String(row.completed_lesson_ids ?? '[]')),
    earnedBadgeIds: JSON.parse(String(row.earned_badge_ids ?? '[]')),
    isDemoUser: Boolean(row.is_demo_user),
  };
}

function mapAttemptRow(row: Record<string, unknown>): AssessmentAttempt {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    subject: String(row.subject) as AssessmentAttempt['subject'],
    grade: Number(row.grade) as 6 | 7 | 8,
    mode: String(row.mode) as 'diagnostic' | 'practice',
    topicFilter: row.topic_filter ? String(row.topic_filter) : undefined,
    answers: JSON.parse(String(row.answers_json ?? '[]')),
    scorePercent: Number(row.score_percent),
    correctCount: Number(row.correct_count),
    totalCount: Number(row.total_count),
    createdAt: String(row.created_at),
    savedOffline: Boolean(row.saved_offline),
  };
}

function mapAssignmentRow(row: Record<string, unknown>): TeacherAssignment {
  return {
    id: String(row.id),
    teacherId: String(row.teacher_id),
    targetStudentId: String(row.target_student_id),
    subject: String(row.subject) as TeacherAssignment['subject'],
    topicId: String(row.topic_id),
    title: String(row.title),
    note: String(row.note),
    createdAt: String(row.created_at),
    isDemoData: Boolean(row.is_demo_data),
  };
}
