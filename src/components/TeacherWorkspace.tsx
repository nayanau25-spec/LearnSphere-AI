import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ClipboardPlus,
  Printer,
  RefreshCw,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {SAMPLE_LESSONS, SUBJECT_METADATA} from '../domain/curriculum';
import {COPY} from '../domain/i18n';
import type {
  AssessmentAttempt,
  Language,
  StudentProfile,
  SubjectId,
  TeacherAssignment,
  TopicMastery,
  UserRole,
} from '../domain/types';

interface ClassroomStudentSummary {
  student: StudentProfile;
  attemptsCount: number;
  averageScore: number | null;
  mastery: TopicMastery[];
  weakTopics: TopicMastery[];
  needsSupport: boolean;
  recentAttempts: AssessmentAttempt[];
}

interface Props {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onSwitchRole: (role: UserRole) => void;
  onBackToLanding: () => void;
}

export const TeacherWorkspace: React.FC<Props> = ({
  language,
  onChangeLanguage,
  onSwitchRole,
  onBackToLanding,
}) => {
  const t = COPY[language];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<ClassroomStudentSummary[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [totalSyncedEvents, setTotalSyncedEvents] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    'demo-student-asha',
  );

  // Assignment form state
  const [targetStudentId, setTargetStudentId] = useState<string>('all');
  const [subject, setSubject] = useState<SubjectId>('mathematics');
  const [topicId, setTopicId] = useState<string>('math-fractions');
  const [title, setTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const loadClassroom = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/classroom', {
        headers: {'x-user-role': 'teacher'},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load classroom (${res.status})`);
      }
      const data = (await res.json()) as {
        students: ClassroomStudentSummary[];
        assignments: TeacherAssignment[];
        totalSyncedEvents: number;
      };
      setStudents(data.students);
      setAssignments(data.assignments);
      setTotalSyncedEvents(data.totalSyncedEvents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load teacher classroom data.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClassroom();
  }, [loadClassroom]);

  const selectedSummary = useMemo(
    () =>
      students.find((s) => s.student.id === selectedStudentId) ?? students[0],
    [students, selectedStudentId],
  );

  // Aggregate topic mastery across class
  const classTopicStats = useMemo(() => {
    const map = new Map<
      string,
      {topicName: string; scores: number[]; weakCount: number}
    >();
    for (const s of students) {
      for (const m of s.mastery) {
        const entry = map.get(m.topicId) ?? {
          topicName: m.topicName,
          scores: [],
          weakCount: 0,
        };
        entry.scores.push(m.masteryScore);
        if (m.status === 'weak') entry.weakCount += 1;
        map.set(m.topicId, entry);
      }
    }
    return Array.from(map.entries()).map(([id, data]) => ({
      topicId: id,
      topicName: data.topicName,
      avgMastery: Math.round(
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      ),
      weakCount: data.weakCount,
    }));
  }, [students]);

  const studentsNeedingSupport = students.filter((s) => s.needsSupport);

  const subjectTopics = useMemo(
    () => SAMPLE_LESSONS.filter((l) => l.subject === subject),
    [subject],
  );

  const handleSubjectChange = (nextSub: SubjectId) => {
    setSubject(nextSub);
    const firstTopic = SAMPLE_LESSONS.find((l) => l.subject === nextSub);
    if (firstTopic) setTopicId(firstTopic.topicId);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !note.trim()) {
      setFormMsg('Please enter both an assignment title and instruction note.');
      return;
    }

    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'teacher',
        },
        body: JSON.stringify({
          targetStudentId,
          subject,
          topicId,
          title: title.trim(),
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not create assignment.');
      }
      setTitle('');
      setNote('');
      setFormMsg('Assignment published and visible on student dashboards.');
      await loadClassroom();
    } catch (err) {
      setFormMsg(
        err instanceof Error ? err.message : 'Error publishing assignment.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-800 bg-[#0A1128] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t.backToLanding}
            </button>
            <span className="text-slate-600" aria-hidden="true">
              |
            </span>
            <span className="font-display text-base font-bold">
              LearnSphere AI · Teacher Insights (Demo Role)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadClassroom()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh Synced Data
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Print Report
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage(language === 'en' ? 'kn' : 'en')}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('student')}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Switch to Student View
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-600">
          Role-protected classroom view (
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">
            x-user-role: teacher
          </code>
          ). Classmates marked Demo Classmate represent seeded baseline classroom
          records; <strong>Asha Kumari</strong> reflects live synced quiz
          submissions.
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Loading classroom analytics...
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="text-xs text-slate-500">Class Roster</span>
                <div className="mt-2 flex items-center gap-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  {students.length} students
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="text-xs text-slate-500">
                  Needing Support
                </span>
                <div className="mt-2 flex items-center gap-2 font-mono text-2xl font-bold text-amber-700 tabular-nums">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  {studentsNeedingSupport.length}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="text-xs text-slate-500">
                  Active Assignments
                </span>
                <div className="mt-2 flex items-center gap-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  <BookOpen
                    className="h-4 w-4 text-cyan-600"
                    aria-hidden="true"
                  />
                  {assignments.length}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="text-xs text-slate-500">
                  Synced Student Events
                </span>
                <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {totalSyncedEvents}
                </div>
              </div>
            </div>

            {/* Topic Weak Areas Chart + Student Roster */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Class-Wide Topic Mastery & Weak Areas
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Average mastery percentage across assessed students per topic.
                </p>

                {classTopicStats.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No topic mastery data recorded yet.
                  </p>
                ) : (
                  <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={classTopicStats}
                        margin={{top: 10, right: 16, left: 24, bottom: 36}}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="topicName"
                          tick={{fontSize: 11, fill: '#475569'}}
                          interval={0}
                          angle={-12}
                          textAnchor="end"
                          height={54}
                        />
                        <YAxis
                          domain={[0, 100]}
                          width={36}
                          tick={{fontSize: 11, fill: '#475569'}}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="avgMastery"
                          fill="#0891B2"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Student List & Drilldown */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Student Progress & Support Queue
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs text-slate-500">
                      <tr>
                        <th className="py-2 pr-3">Student</th>
                        <th className="py-2 px-3">Grade</th>
                        <th className="py-2 px-3 text-right">Avg Score</th>
                        <th className="py-2 pl-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => {
                        const selected =
                          s.student.id === selectedSummary?.student.id;
                        return (
                          <tr
                            key={s.student.id}
                            className={
                              selected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                            }
                          >
                            <td className="py-2.5 pr-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedStudentId(s.student.id)
                                }
                                className="font-semibold text-blue-700 hover:underline text-left"
                              >
                                {s.student.name}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-xs tabular-nums">
                              {s.student.grade}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                              {s.averageScore !== null
                                ? `${s.averageScore}%`
                                : '—'}
                            </td>
                            <td className="py-2.5 pl-3 text-xs">
                              {s.needsSupport ? (
                                <span className="font-semibold text-amber-700">
                                  Needs support ({s.weakTopics.length} weak)
                                </span>
                              ) : s.attemptsCount === 0 ? (
                                <span className="text-slate-500">
                                  No quiz synced yet
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-700">
                                  On track
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Selected Student Detail + Assignment Creator */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {selectedSummary && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Student Detail: {selectedSummary.student.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 tabular-nums">
                    Grade {selectedSummary.student.grade} ·{' '}
                    {selectedSummary.attemptsCount} assessment(s) ·{' '}
                    {selectedSummary.student.points} pts
                  </p>

                  {selectedSummary.mastery.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No synced assessments for this student yet. Complete a
                      quiz in Student View and sync to see live updates here.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-2.5">
                      {selectedSummary.mastery.map((m) => (
                        <div
                          key={m.topicId}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">
                              {m.topicName}
                            </span>
                            <p className="text-xs text-slate-500">
                              Recommended level: {m.recommendedDifficulty}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-mono font-bold tabular-nums ${
                                m.status === 'weak'
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {m.masteryScore}%
                            </span>
                            <p className="text-xs capitalize text-slate-500">
                              {m.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Functional Assign Quiz / Lesson Form */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
                <h3 className="font-display flex items-center gap-2 text-base font-bold text-slate-900">
                  <ClipboardPlus
                    className="h-4 w-4 text-blue-600"
                    aria-hidden="true"
                  />
                  Assign Targeted Lesson or Practice Quiz
                </h3>
                <form
                  onSubmit={(e) => void handleAssignSubmit(e)}
                  className="mt-4 space-y-3.5"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="assign-student"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Target Student
                      </label>
                      <select
                        id="assign-student"
                        value={targetStudentId}
                        onChange={(e) => setTargetStudentId(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="all">Entire Class</option>
                        {students.map((s) => (
                          <option key={s.student.id} value={s.student.id}>
                            {s.student.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="assign-subject"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Subject
                      </label>
                      <select
                        id="assign-subject"
                        value={subject}
                        onChange={(e) =>
                          handleSubjectChange(e.target.value as SubjectId)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {(['mathematics', 'science', 'english'] as const).map(
                          (sub) => (
                            <option key={sub} value={sub}>
                              {SUBJECT_METADATA[sub].name[language]}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="assign-topic"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Topic
                    </label>
                    <select
                      id="assign-topic"
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {subjectTopics.map((lesson) => (
                        <option key={lesson.topicId} value={lesson.topicId}>
                          {lesson.topicName[language]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="assign-title"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Assignment Title
                    </label>
                    <input
                      id="assign-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Weekend Fractions Revision Quiz"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assign-note"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Instructions for Student
                    </label>
                    <textarea
                      id="assign-note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Download the lesson offline and complete 3 practice questions."
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  {formMsg && (
                    <p className="text-xs font-medium text-blue-700">
                      {formMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-300"
                  >
                    {submitting ? 'Publishing...' : 'Publish Assignment'}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
