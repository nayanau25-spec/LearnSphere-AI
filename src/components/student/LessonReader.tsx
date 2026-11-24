import React, {useMemo, useState} from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  HardDrive,
  Trash2,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  calculateAssessmentScore,
  selectAdaptivePracticeQuestions,
} from '../../domain/adaptiveEngine';
import {
  SAMPLE_LESSONS,
  SAMPLE_QUESTIONS,
  SUBJECT_METADATA,
} from '../../domain/curriculum';
import {COPY} from '../../domain/i18n';
import type {
  AnsweredQuestion,
  AssessmentAttempt,
  DifficultyLevel,
  GradeLevel,
  Language,
  Lesson,
  SubjectId,
  TopicMastery,
} from '../../domain/types';
import type {CachedLessonRecord} from '../../storage/offlineDb';

interface Props {
  studentId: string;
  grade: GradeLevel;
  language: Language;
  isEffectiveOnline: boolean;
  cachedLessons: CachedLessonRecord[];
  masteryList: TopicMastery[];
  activeLessonId: string | null;
  onSelectLesson: (lessonId: string | null) => void;
  onDownloadOffline: (lesson: Lesson) => Promise<void>;
  onRemoveOffline: (lessonId: string) => Promise<void>;
  onCompletePractice: (
    attempt: AssessmentAttempt,
    lessonId: string,
  ) => Promise<void>;
  onReadAloud: (text: string) => void;
}

export const LessonReader: React.FC<Props> = ({
  studentId,
  grade,
  language,
  isEffectiveOnline,
  cachedLessons,
  masteryList,
  activeLessonId,
  onSelectLesson,
  onDownloadOffline,
  onRemoveOffline,
  onCompletePractice,
  onReadAloud,
}) => {
  const t = COPY[language];
  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectId>('all');
  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<AnsweredQuestion[]>(
    [],
  );
  const [practiceSummary, setPracticeSummary] =
    useState<AssessmentAttempt | null>(null);

  const cachedMap = useMemo(
    () => new Map(cachedLessons.map((c) => [c.lessonId, c])),
    [cachedLessons],
  );

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    const cached = cachedMap.get(activeLessonId);
    if (cached) return cached.lesson;
    if (!isEffectiveOnline) return null; // Offline mode only opens cached lessons!
    return SAMPLE_LESSONS.find((l) => l.id === activeLessonId) ?? null;
  }, [activeLessonId, cachedMap, isEffectiveOnline]);

  const targetDifficulty: DifficultyLevel = useMemo(() => {
    if (!activeLesson) return 'beginner';
    const mastery = masteryList.find((m) => m.topicId === activeLesson.topicId);
    return mastery?.recommendedDifficulty ?? activeLesson.difficulty;
  }, [activeLesson, masteryList]);

  const practiceQuestions = useMemo(() => {
    if (!activeLesson) return [];
    return selectAdaptivePracticeQuestions(
      SAMPLE_QUESTIONS,
      activeLesson.topicId,
      targetDifficulty,
      3,
    );
  }, [activeLesson, targetDifficulty]);

  const filteredLessons = useMemo(() => {
    const base = isEffectiveOnline
      ? SAMPLE_LESSONS
      : cachedLessons.map((c) => c.lesson);
    if (subjectFilter === 'all') return base;
    return base.filter((l) => l.subject === subjectFilter);
  }, [isEffectiveOnline, cachedLessons, subjectFilter]);

  const startPractice = () => {
    setPracticeActive(true);
    setPracticeIdx(0);
    setSelectedOpt(null);
    setRevealed(false);
    setPracticeAnswers([]);
    setPracticeSummary(null);
  };

  const handleNextPractice = async () => {
    const currentQ = practiceQuestions[practiceIdx];
    if (selectedOpt === null || !currentQ || !activeLesson) return;

    const entry: AnsweredQuestion = {
      questionId: currentQ.id,
      topicId: currentQ.topicId,
      difficulty: currentQ.difficulty,
      selectedIndex: selectedOpt,
      correctIndex: currentQ.correctIndex,
      isCorrect: selectedOpt === currentQ.correctIndex,
    };
    const nextAnswers = [...practiceAnswers, entry];
    setPracticeAnswers(nextAnswers);

    if (practiceIdx + 1 < practiceQuestions.length) {
      setPracticeIdx(practiceIdx + 1);
      setSelectedOpt(null);
      setRevealed(false);
      return;
    }

    const {correctCount, totalCount, scorePercent} =
      calculateAssessmentScore(nextAnswers);
    const attempt: AssessmentAttempt = {
      id: `prac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      subject: activeLesson.subject,
      grade,
      mode: 'practice',
      topicFilter: activeLesson.topicId,
      answers: nextAnswers,
      scorePercent,
      correctCount,
      totalCount,
      createdAt: new Date().toISOString(),
      savedOffline: !isEffectiveOnline,
    };
    await onCompletePractice(attempt, activeLesson.id);
    setPracticeSummary(attempt);
    setPracticeActive(false);
  };

  if (activeLessonId && !activeLesson) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h3 className="font-display text-lg font-bold">
          Lesson not available offline
        </h3>
        <p className="mt-1.5 text-sm">
          You are currently in Offline Mode and this lesson has not been saved
          to IndexedDB yet. Restore connectivity to download it, or open one of
          your cached lessons below.
        </p>
        <button
          type="button"
          onClick={() => onSelectLesson(null)}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Back to Offline Library
        </button>
      </div>
    );
  }

  if (activeLesson) {
    const isCached = cachedMap.has(activeLesson.id);
    const cachedMeta = cachedMap.get(activeLesson.id);
    const fullTextToRead = [
      activeLesson.title[language],
      activeLesson.summary[language],
      ...activeLesson.sections.map(
        (s) => `${s.heading[language]}. ${s.body[language]}`,
      ),
    ].join(' ');

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setPracticeActive(false);
              setPracticeSummary(null);
              onSelectLesson(null);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Lessons
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onReadAloud(fullTextToRead)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t.readAloud}
            </button>

            {isCached ? (
              <button
                type="button"
                onClick={() => void onRemoveOffline(activeLesson.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t.savedOffline} (
                {Math.max(1, Math.round((cachedMeta?.sizeBytes ?? 1024) / 1024))}{' '}
                KB)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onDownloadOffline(activeLesson)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {t.downloadOffline}
              </button>
            )}
          </div>
        </div>

        <article className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="text-xs text-slate-500">
            {SUBJECT_METADATA[activeLesson.subject].name[language]} ·{' '}
            {activeLesson.topicName[language]} · {activeLesson.estimatedMinutes}{' '}
            min · Adaptive Difficulty:{' '}
            <span className="font-semibold capitalize text-blue-700">
              {targetDifficulty}
            </span>
          </div>

          <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">
            {activeLesson.title[language]}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {activeLesson.summary[language]}
          </p>

          <div className="mt-6 space-y-6 border-t border-slate-200 pt-6">
            {activeLesson.sections.map((sec, idx) => (
              <section key={idx} className="space-y-2">
                <h3 className="font-display text-base font-bold text-slate-900">
                  {sec.heading[language]}
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {sec.body[language]}
                </p>
                {sec.example && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800">
                    {sec.example[language]}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
            <h4 className="text-xs font-semibold text-blue-800">
              Key Takeaways
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-800">
              {activeLesson.keyTakeaways.map((item, i) => (
                <li key={i}>• {item[language]}</li>
              ))}
            </ul>
          </div>
        </article>

        {/* Adaptive Practice Quiz inside Lesson */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {!practiceActive && !practiceSummary && (
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Practice Quiz ({targetDifficulty} level)
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {isEffectiveOnline
                    ? 'Test your understanding with questions tuned to your mastery level.'
                    : 'Offline Mode active: your answers will be saved locally to IndexedDB and queued for sync.'}
                </p>
              </div>
              <button
                type="button"
                onClick={startPractice}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0"
              >
                Start Practice Quiz ({practiceQuestions.length} Questions)
              </button>
            </div>
          )}

          {practiceActive && practiceQuestions[practiceIdx] && (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
                <span>
                  Practice Question {practiceIdx + 1} of{' '}
                  {practiceQuestions.length} ·{' '}
                  <span className="capitalize">
                    {practiceQuestions[practiceIdx].difficulty}
                  </span>
                </span>
                <span>
                  {isEffectiveOnline ? 'Online' : 'Offline Local Save'}
                </span>
              </div>

              <h4 className="font-display mt-4 text-base font-bold text-slate-900">
                {practiceQuestions[practiceIdx].prompt[language]}
              </h4>

              <div className="mt-4 space-y-2.5">
                {practiceQuestions[practiceIdx].options.map((opt, idx) => {
                  const isRight =
                    idx === practiceQuestions[practiceIdx].correctIndex;
                  const isChosen = selectedOpt === idx;
                  let cls =
                    'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                  if (revealed) {
                    if (isRight) {
                      cls =
                        'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium';
                    } else if (isChosen) {
                      cls = 'border-red-500 bg-red-50 text-red-950';
                    }
                  } else if (isChosen) {
                    cls =
                      'border-blue-600 bg-blue-50 text-blue-950 font-medium';
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={revealed}
                      onClick={() => setSelectedOpt(idx)}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm ${cls}`}
                    >
                      <span>{opt[language]}</span>
                      {revealed && isRight && (
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-600 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {revealed && isChosen && !isRight && (
                        <XCircle
                          className="h-4 w-4 text-red-600 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800">
                  {practiceQuestions[practiceIdx].explanation[language]}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                {!revealed ? (
                  <button
                    type="button"
                    disabled={selectedOpt === null}
                    onClick={() => setRevealed(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-300"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleNextPractice()}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    {practiceIdx + 1 < practiceQuestions.length
                      ? 'Next Question'
                      : 'Finish & Save Progress'}
                  </button>
                )}
              </div>
            </div>
          )}

          {practiceSummary && (
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  {practiceSummary.savedOffline
                    ? 'Saved Offline to IndexedDB · Pending Sync Event Created'
                    : 'Practice Completed & Synced'}
                </p>
                <h4 className="font-display mt-1 text-lg font-bold text-slate-900">
                  Practice Score:{' '}
                  <span className="font-mono tabular-nums">
                    {practiceSummary.scorePercent}%
                  </span>{' '}
                  ({practiceSummary.correctCount}/{practiceSummary.totalCount})
                </h4>
              </div>
              <button
                type="button"
                onClick={startPractice}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Practise Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t.lessons}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isEffectiveOnline
              ? 'Download any lesson to IndexedDB so you can study and complete quizzes without internet.'
              : 'Offline Mode Active: displaying your locally downloaded lessons stored in IndexedDB.'}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(['all', 'mathematics', 'science', 'english'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSubjectFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                subjectFilter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'all' ? 'All Subjects' : SUBJECT_METADATA[f].name[language]}
            </button>
          ))}
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <HardDrive
            className="mx-auto h-8 w-8 text-slate-400"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No offline lessons downloaded yet
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Restore connectivity and click &ldquo;Save for Offline&rdquo; on any
            lesson to cache it locally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => {
            const cached = cachedMap.get(lesson.id);
            return (
              <div
                key={lesson.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {SUBJECT_METADATA[lesson.subject].name[language]} ·{' '}
                      {lesson.estimatedMinutes} min
                    </span>
                    <span className="capitalize">{lesson.difficulty}</span>
                  </div>
                  <h3 className="font-display mt-2 text-base font-bold text-slate-900">
                    {lesson.title[language]}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {lesson.summary[language]}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0"
                  >
                    {t.openLesson}
                  </button>

                  {cached ? (
                    <button
                      type="button"
                      onClick={() => void onRemoveOffline(lesson.id)}
                      aria-label={`Remove offline copy of ${lesson.title.en}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Saved
                      <Trash2 className="ml-1 h-3 w-3 text-emerald-700" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void onDownloadOffline(lesson)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Save Offline
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
