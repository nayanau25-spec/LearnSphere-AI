import React, {useMemo, useState} from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  calculateAssessmentScore,
  computeTopicBreakdownFromAttempt,
  computeTopicMasteryMap,
  generateAdaptiveRecommendations,
} from '../../domain/adaptiveEngine';
import {
  SAMPLE_LESSONS,
  SAMPLE_QUESTIONS,
  SUBJECT_METADATA,
} from '../../domain/curriculum';
import type {
  AdaptiveRecommendation,
  AnsweredQuestion,
  AssessmentAttempt,
  GradeLevel,
  Language,
  SubjectId,
} from '../../domain/types';

interface Props {
  studentId: string;
  grade: GradeLevel;
  language: Language;
  isEffectiveOnline: boolean;
  existingAttempts: AssessmentAttempt[];
  onCompleteAttempt: (attempt: AssessmentAttempt) => Promise<void>;
  onOpenLesson: (lessonId: string) => void;
  onReadAloud: (text: string) => void;
}

export const DiagnosticRunner: React.FC<Props> = ({
  studentId,
  grade,
  language,
  isEffectiveOnline,
  existingAttempts,
  onCompleteAttempt,
  onOpenLesson,
  onReadAloud,
}) => {
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectId>('mathematics');
  const [phase, setPhase] = useState<'select' | 'running' | 'results'>(
    'select',
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [chosenOption, setChosenOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [completedAttempt, setCompletedAttempt] =
    useState<AssessmentAttempt | null>(null);
  const [saving, setSaving] = useState(false);

  // Pick a balanced diagnostic set (up to 6 questions across topics for selected subject)
  const diagnosticQuestions = useMemo(() => {
    const bySubject = SAMPLE_QUESTIONS.filter(
      (q) => q.subject === selectedSubject,
    );
    const topicBuckets = new Map<string, typeof bySubject>();
    for (const q of bySubject) {
      const list = topicBuckets.get(q.topicId) ?? [];
      list.push(q);
      topicBuckets.set(q.topicId, list);
    }
    const picked: typeof bySubject = [];
    for (const list of topicBuckets.values()) {
      // Take up to 2 questions per topic (beginner + intermediate/advanced)
      picked.push(...list.slice(0, 2));
    }
    return picked.slice(0, 6);
  }, [selectedSubject]);

  const currentQuestion = diagnosticQuestions[currentIdx];

  const startAssessment = () => {
    setAnswers([]);
    setCurrentIdx(0);
    setChosenOption(null);
    setRevealed(false);
    setCompletedAttempt(null);
    setPhase('running');
  };

  const handleSubmitOption = () => {
    if (chosenOption === null || !currentQuestion) return;
    setRevealed(true);
  };

  const handleNextQuestion = async () => {
    if (chosenOption === null || !currentQuestion) return;

    const entry: AnsweredQuestion = {
      questionId: currentQuestion.id,
      topicId: currentQuestion.topicId,
      difficulty: currentQuestion.difficulty,
      selectedIndex: chosenOption,
      correctIndex: currentQuestion.correctIndex,
      isCorrect: chosenOption === currentQuestion.correctIndex,
    };

    const nextAnswers = [...answers, entry];
    setAnswers(nextAnswers);

    if (currentIdx + 1 < diagnosticQuestions.length) {
      setCurrentIdx(currentIdx + 1);
      setChosenOption(null);
      setRevealed(false);
      return;
    }

    // Finish diagnostic
    setSaving(true);
    const {correctCount, totalCount, scorePercent} =
      calculateAssessmentScore(nextAnswers);
    const attempt: AssessmentAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      subject: selectedSubject,
      grade,
      mode: 'diagnostic',
      answers: nextAnswers,
      scorePercent,
      correctCount,
      totalCount,
      createdAt: new Date().toISOString(),
      savedOffline: !isEffectiveOnline,
    };

    await onCompleteAttempt(attempt);
    setCompletedAttempt(attempt);
    setSaving(false);
    setPhase('results');
  };

  const resultsAnalysis = useMemo(() => {
    if (!completedAttempt) return null;
    const qLookup = new Map(SAMPLE_QUESTIONS.map((q) => [q.id, q]));
    const topicBreakdown = computeTopicBreakdownFromAttempt(
      completedAttempt,
      qLookup,
    );
    const allAttempts = [completedAttempt, ...existingAttempts];
    const mastery = computeTopicMasteryMap(allAttempts, SAMPLE_QUESTIONS);
    const recommendations = generateAdaptiveRecommendations(
      mastery,
      SAMPLE_LESSONS,
      completedAttempt.subject,
    );
    const weakTopics = topicBreakdown.filter((t) => t.accuracy < 60);
    return {
      topicBreakdown,
      weakTopics,
      recommendations,
    };
  }, [completedAttempt, existingAttempts]);

  if (phase === 'select') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {language === 'kn'
              ? 'ವಿಷಯ ಮೌಲ್ಯಮಾಪನ ಪರೀಕ್ಷೆ ಆರಂಭಿಸಿ'
              : 'Diagnostic Assessment Engine'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            {language === 'kn'
              ? 'ನಿಮ್ಮ ಬಲವಾದ ಮತ್ತು ಸುಧಾರಣೆ ಬೇಕಾದ ವಿಷಯಗಳನ್ನು ಗುರುತಿಸಲು ವಿಷಯವನ್ನು ಆರಿಸಿ.'
              : 'Choose a subject to assess your current understanding across core topics. Works online or offline.'}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {(['mathematics', 'science', 'english'] as const).map((subId) => {
              const meta = SUBJECT_METADATA[subId];
              const active = selectedSubject === subId;
              const qCount = SAMPLE_QUESTIONS.filter(
                (q) => q.subject === subId,
              ).length;
              return (
                <button
                  key={subId}
                  type="button"
                  onClick={() => setSelectedSubject(subId)}
                  className={`flex flex-col items-start rounded-xl border p-5 text-left transition-colors ${
                    active
                      ? 'border-blue-600 bg-blue-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-bold text-slate-900">
                    {meta.name[language]}
                  </span>
                  <span className="mt-1 text-xs text-slate-600">
                    {meta.subtitle[language]}
                  </span>
                  <span className="mt-3 font-mono text-xs text-slate-500 tabular-nums">
                    {qCount} sample items · Grade {grade}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <div className="text-xs text-slate-500">
              {isEffectiveOnline
                ? 'Connected: results will save locally and sync automatically.'
                : 'Offline Mode: results will save to IndexedDB and queue for sync.'}
            </div>
            <button
              type="button"
              onClick={startAssessment}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Start {SUBJECT_METADATA[selectedSubject].name[language]} Diagnostic
              ({diagnosticQuestions.length} Questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'running' && currentQuestion) {
    const isCorrect = chosenOption === currentQuestion.correctIndex;
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-xs text-slate-500">
          <span>
            {SUBJECT_METADATA[selectedSubject].name[language]} ·{' '}
            {currentQuestion.topicName[language]} ·{' '}
            <span className="capitalize">{currentQuestion.difficulty}</span>
          </span>
          <span className="font-mono font-semibold text-slate-800 tabular-nums">
            Question {currentIdx + 1} / {diagnosticQuestions.length}
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${((currentIdx + 1) / diagnosticQuestions.length) * 100}%`,
            }}
          />
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-slate-900">
            {currentQuestion.prompt[language]}
          </h3>
          <button
            type="button"
            onClick={() => onReadAloud(currentQuestion.prompt[language])}
            aria-label="Read question aloud"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 shrink-0"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-3" role="radiogroup" aria-label="Answer options">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = chosenOption === idx;
            const isRightAnswer = idx === currentQuestion.correctIndex;
            let stateStyle =
              'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
            if (revealed) {
              if (isRightAnswer) {
                stateStyle =
                  'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium';
              } else if (isSelected && !isRightAnswer) {
                stateStyle = 'border-red-500 bg-red-50 text-red-950';
              }
            } else if (isSelected) {
              stateStyle = 'border-blue-600 bg-blue-50 text-blue-950 font-medium';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={revealed}
                onClick={() => setChosenOption(idx)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${stateStyle}`}
              >
                <span>{opt[language]}</span>
                {revealed && isRightAnswer && (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {revealed && isSelected && !isRightAnswer && (
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
          <div
            className={`mt-5 rounded-lg border p-4 text-sm ${
              isCorrect
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                : 'border-amber-200 bg-amber-50/70 text-amber-950'
            }`}
          >
            <p className="font-semibold">
              {isCorrect ? 'Correct!' : 'Needs Review'}
            </p>
            <p className="mt-1 leading-relaxed">
              {currentQuestion.explanation[language]}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setPhase('select')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          {!revealed ? (
            <button
              type="button"
              disabled={chosenOption === null}
              onClick={handleSubmitOption}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleNextQuestion()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {currentIdx + 1 < diagnosticQuestions.length
                ? 'Next Question'
                : saving
                  ? 'Saving...'
                  : 'View Adaptive Analysis'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'results' && completedAttempt && resultsAnalysis) {
    const topRec: AdaptiveRecommendation | undefined =
      resultsAnalysis.recommendations[0];

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-700">
                Diagnostic Results ·{' '}
                {completedAttempt.savedOffline
                  ? 'Saved Locally Offline (Queued for Sync)'
                  : 'Saved & Synced'}
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold text-slate-900">
                Overall Score:{' '}
                <span className="font-mono tabular-nums">
                  {completedAttempt.scorePercent}%
                </span>{' '}
                ({completedAttempt.correctCount}/{completedAttempt.totalCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={startAssessment}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Retake Diagnostic
            </button>
          </div>

          {/* Topic-Wise Breakdown */}
          <h3 className="mt-6 text-sm font-semibold text-slate-900">
            Topic-Wise Performance Analysis
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {resultsAnalysis.topicBreakdown.map((item) => {
              const weak = item.accuracy < 60;
              return (
                <div
                  key={item.topicId}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">
                      {item.topicName}
                    </span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        weak ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {item.accuracy}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {item.correct} of {item.total} correct ·{' '}
                    {weak ? 'Needs improvement' : 'On track'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explainable Adaptive Recommendation */}
        {topRec && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6">
            <p className="text-xs font-semibold text-blue-700">
              Explainable Adaptive Recommendation
            </p>
            <h3 className="font-display mt-1 text-xl font-bold text-slate-900">
              Recommended Lesson: {topRec.lessonTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              {topRec.explanation[language]}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-blue-200/80 pt-4 text-xs text-slate-700 sm:grid-cols-4">
              <div>
                <span className="block text-slate-500">Recent Accuracy</span>
                <span className="font-mono font-semibold tabular-nums">
                  {topRec.formulaBreakdown.recentAccuracy}%
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Difficulty Target</span>
                <span className="font-semibold capitalize">
                  {topRec.targetDifficulty}
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Repeat Penalty</span>
                <span className="font-mono font-semibold tabular-nums">
                  -{topRec.formulaBreakdown.repeatPenalty} pts
                </span>
              </div>
              <div>
                <span className="block text-slate-500">Mastery Score</span>
                <span className="font-mono font-semibold tabular-nums">
                  {topRec.formulaBreakdown.finalMasteryScore}%
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => onOpenLesson(topRec.lessonId)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Open Recommended Lesson & Practise
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
