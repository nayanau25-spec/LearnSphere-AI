import type {
  AdaptiveRecommendation,
  AnsweredQuestion,
  AssessmentAttempt,
  DifficultyLevel,
  Lesson,
  Question,
  SubjectId,
  TopicMastery,
} from './types';

/**
 * EXPLAINABLE ADAPTIVE ENGINE FORMULA (Deterministic Rule-Based)
 *
 * Note: This is a transparent, deterministic pedagogical scoring algorithm—NOT
 * a trained machine-learning model. Every recommendation exposes its exact inputs.
 *
 * Formula per topic:
 *   rawScore = 0.50 * recentAccuracy
 *            + 0.30 * cumulativeAccuracy
 *            + 0.20 * difficultyWeightedAccuracy
 *   repeatPenalty = min(15, repeatWrongCount * 5)
 *   masteryScore = clamp(round(rawScore - repeatPenalty), 0, 100)
 *
 * Difficulty weights:
 *   beginner = 1.0, intermediate = 1.2, advanced = 1.4
 *
 * Limitations:
 * - Relies on multiple-choice accuracy rather than open-ended step reasoning.
 * - Assumes uniform topic granularity across Mathematics, Science, and English.
 * - Requires periodic calibration with teacher observations in real classrooms.
 */

const DIFFICULTY_WEIGHT: Record<DifficultyLevel, number> = {
  beginner: 1.0,
  intermediate: 1.2,
  advanced: 1.4,
};

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateAssessmentScore(answers: AnsweredQuestion[]): {
  correctCount: number;
  totalCount: number;
  scorePercent: number;
} {
  const totalCount = answers.length;
  if (totalCount === 0) {
    return {correctCount: 0, totalCount: 0, scorePercent: 0};
  }
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);
  return {correctCount, totalCount, scorePercent};
}

export function computeTopicBreakdownFromAttempt(
  attempt: AssessmentAttempt,
  questionLookup: Map<string, Question>,
): Array<{
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  accuracy: number;
}> {
  const byTopic = new Map<
    string,
    {topicName: string; correct: number; total: number}
  >();

  for (const ans of attempt.answers) {
    const q = questionLookup.get(ans.questionId);
    const topicName = q ? q.topicName.en : ans.topicId;
    const entry = byTopic.get(ans.topicId) ?? {
      topicName,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (ans.isCorrect) entry.correct += 1;
    byTopic.set(ans.topicId, entry);
  }

  return Array.from(byTopic.entries()).map(([topicId, data]) => ({
    topicId,
    topicName: data.topicName,
    correct: data.correct,
    total: data.total,
    accuracy:
      data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));
}

export function determineRecommendedDifficulty(
  masteryScore: number,
  recentAccuracy: number,
): DifficultyLevel {
  if (masteryScore < 55 || recentAccuracy < 50) {
    return 'beginner';
  }
  if (masteryScore < 80) {
    return 'intermediate';
  }
  return 'advanced';
}

export function determineMasteryStatus(
  masteryScore: number,
): TopicMastery['status'] {
  if (masteryScore < 55) return 'weak';
  if (masteryScore < 75) return 'developing';
  if (masteryScore < 85) return 'proficient';
  return 'mastered';
}

export function computeTopicMasteryMap(
  attempts: AssessmentAttempt[],
  questions: Question[],
): TopicMastery[] {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const sortedAttempts = [...attempts].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  interface TopicAccumulator {
    topicId: string;
    topicName: string;
    subject: SubjectId;
    totalCorrect: number;
    totalQuestions: number;
    weightedEarned: number;
    weightedPossible: number;
    attemptAccuracies: number[];
    repeatWrongCount: number;
    lastUpdatedAt: string;
  }

  const accumulators = new Map<string, TopicAccumulator>();

  for (const attempt of sortedAttempts) {
    const attemptTopicAnswers = new Map<string, AnsweredQuestion[]>();
    for (const ans of attempt.answers) {
      const list = attemptTopicAnswers.get(ans.topicId) ?? [];
      list.push(ans);
      attemptTopicAnswers.set(ans.topicId, list);
    }

    for (const [topicId, ansList] of attemptTopicAnswers.entries()) {
      const sampleQ = questionMap.get(ansList[0].questionId);
      const topicName = sampleQ?.topicName.en ?? topicId;
      const subject = sampleQ?.subject ?? attempt.subject;

      const acc = accumulators.get(topicId) ?? {
        topicId,
        topicName,
        subject,
        totalCorrect: 0,
        totalQuestions: 0,
        weightedEarned: 0,
        weightedPossible: 0,
        attemptAccuracies: [],
        repeatWrongCount: 0,
        lastUpdatedAt: attempt.createdAt,
      };

      let attemptCorrect = 0;
      for (const ans of ansList) {
        const w = DIFFICULTY_WEIGHT[ans.difficulty];
        acc.totalQuestions += 1;
        acc.weightedPossible += w;
        if (ans.isCorrect) {
          acc.totalCorrect += 1;
          acc.weightedEarned += w;
          attemptCorrect += 1;
        } else {
          acc.repeatWrongCount += 1;
        }
      }

      const attemptAcc = Math.round((attemptCorrect / ansList.length) * 100);
      acc.attemptAccuracies.push(attemptAcc);
      acc.lastUpdatedAt = attempt.createdAt;
      accumulators.set(topicId, acc);
    }
  }

  const results: TopicMastery[] = [];
  for (const acc of accumulators.values()) {
    const recentAccuracy =
      acc.attemptAccuracies[acc.attemptAccuracies.length - 1] ?? 0;
    const prevAccuracy =
      acc.attemptAccuracies.length > 1
        ? acc.attemptAccuracies[acc.attemptAccuracies.length - 2]
        : recentAccuracy;
    const cumulativeAccuracy =
      acc.totalQuestions > 0
        ? Math.round((acc.totalCorrect / acc.totalQuestions) * 100)
        : 0;
    const difficultyWeightedAccuracy =
      acc.weightedPossible > 0
        ? Math.round((acc.weightedEarned / acc.weightedPossible) * 100)
        : 0;

    // Only apply repeat penalty if cumulative accuracy is below 75%
    const effectiveRepeatWrongs =
      recentAccuracy >= 80 ? 0 : Math.max(0, acc.repeatWrongCount - 1);
    const repeatPenalty = Math.min(15, effectiveRepeatWrongs * 5);

    const rawScore =
      0.5 * recentAccuracy +
      0.3 * cumulativeAccuracy +
      0.2 * difficultyWeightedAccuracy -
      repeatPenalty;

    const masteryScore = clampScore(rawScore);
    const recommendedDifficulty = determineRecommendedDifficulty(
      masteryScore,
      recentAccuracy,
    );
    const status = determineMasteryStatus(masteryScore);

    results.push({
      topicId: acc.topicId,
      topicName: acc.topicName,
      subject: acc.subject,
      masteryScore,
      recentAccuracy,
      cumulativeAccuracy,
      difficultyWeightedAccuracy,
      repeatWrongCount: acc.repeatWrongCount,
      attemptsCount: acc.attemptAccuracies.length,
      improvementDelta: recentAccuracy - prevAccuracy,
      recommendedDifficulty,
      status,
      lastUpdatedAt: acc.lastUpdatedAt,
    });
  }

  return results.sort((a, b) => a.masteryScore - b.masteryScore);
}

export function generateAdaptiveRecommendations(
  masteryList: TopicMastery[],
  lessons: Lesson[],
  subjectFilter?: SubjectId,
): AdaptiveRecommendation[] {
  const relevantMastery = subjectFilter
    ? masteryList.filter((m) => m.subject === subjectFilter)
    : masteryList;

  const lessonByTopic = new Map(lessons.map((l) => [l.topicId, l]));
  const recommendations: AdaptiveRecommendation[] = [];

  for (const m of relevantMastery) {
    const lesson = lessonByTopic.get(m.topicId);
    if (!lesson) continue;

    const repeatPenalty = Math.min(
      15,
      (m.recentAccuracy >= 80 ? 0 : Math.max(0, m.repeatWrongCount - 1)) * 5,
    );

    // Avoid repeatedly recommending already mastered topics (>= 85%)
    if (m.status === 'mastered') {
      continue;
    }

    let action: AdaptiveRecommendation['action'] = 'revision_practice';
    let enReason = '';
    let knReason = '';
    let priority = 100 - m.masteryScore;

    if (m.masteryScore < 55) {
      action = 'foundation_lesson';
      priority += 30;
      enReason = `You scored ${m.recentAccuracy}% in ${m.topicName} (mastery ${m.masteryScore}%). Learn the fundamentals in this lesson first, then practise beginner-level questions.`;
      knReason = `ನೀವು ${lesson.topicName.kn} ವಿಷಯದಲ್ಲಿ ${m.recentAccuracy}% ಅಂಕ ಗಳಿಸಿದ್ದೀರಿ (ಪ್ರಾವೀಣ್ಯತೆ ${m.masteryScore}%). ಮೊದಲು ಮೂಲಭೂತ ಪಾಠವನ್ನು ಓದಿ, ನಂತರ ಆರಂಭಿಕ ಹಂತದ ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ.`;
    } else if (m.masteryScore < 75) {
      action = 'revision_practice';
      priority += 15;
      enReason = `Your ${m.topicName} mastery is ${m.masteryScore}% (${m.recentAccuracy}% recent accuracy). Revise the key examples and practise intermediate questions to reach proficiency.`;
      knReason = `${lesson.topicName.kn} ವಿಷಯದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಾವೀಣ್ಯತೆ ${m.masteryScore}% ಇದೆ. ಪ್ರಮುಖ ಉದಾಹರಣೆಗಳನ್ನು ಪುನರಾವರ್ತಿಸಿ ಮತ್ತು ಮಧ್ಯಮ ಹಂತದ ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ.`;
    } else {
      action = 'challenge_advance';
      enReason = `You are progressing well in ${m.topicName} (${m.masteryScore}% mastery). Step up to advanced practice questions to lock in full mastery.`;
      knReason = `ನೀವು ${lesson.topicName.kn} ವಿಷಯದಲ್ಲಿ ಉತ್ತಮ ಪ್ರಗತಿ ಸಾಧಿಸಿದ್ದೀರಿ (${m.masteryScore}%). ಸಂಪೂರ್ಣ ಪ್ರಾವೀಣ್ಯತೆಗಾಗಿ ಮುಂದುವರಿದ ಹಂತದ ಪ್ರಶ್ನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.`;
    }

    recommendations.push({
      id: `rec-${m.topicId}`,
      topicId: m.topicId,
      topicName: m.topicName,
      subject: m.subject,
      lessonId: lesson.id,
      lessonTitle: lesson.title.en,
      action,
      targetDifficulty: m.recommendedDifficulty,
      masteryScore: m.masteryScore,
      priority,
      explanation: {en: enReason, kn: knReason},
      formulaBreakdown: {
        recentAccuracy: m.recentAccuracy,
        cumulativeAccuracy: m.cumulativeAccuracy,
        difficultyWeightedAccuracy: m.difficultyWeightedAccuracy,
        repeatPenalty,
        finalMasteryScore: m.masteryScore,
      },
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

export function selectAdaptivePracticeQuestions(
  questions: Question[],
  topicId: string,
  targetDifficulty: DifficultyLevel,
  limit = 4,
): Question[] {
  const topicQuestions = questions.filter((q) => q.topicId === topicId);
  const exact = topicQuestions.filter((q) => q.difficulty === targetDifficulty);
  const others = topicQuestions.filter(
    (q) => q.difficulty !== targetDifficulty,
  );
  return [...exact, ...others].slice(0, limit);
}
