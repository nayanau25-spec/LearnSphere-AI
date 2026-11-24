import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAssessmentScore,
  computeTopicBreakdownFromAttempt,
  computeTopicMasteryMap,
  determineRecommendedDifficulty,
  generateAdaptiveRecommendations,
  selectAdaptivePracticeQuestions,
} from './adaptiveEngine';
import {SAMPLE_LESSONS, SAMPLE_QUESTIONS} from './curriculum';
import type {AssessmentAttempt} from './types';

test('calculateAssessmentScore computes exact counts and percentage', () => {
  const result = calculateAssessmentScore([
    {
      questionId: 'q1',
      topicId: 'math-fractions',
      difficulty: 'beginner',
      selectedIndex: 1,
      correctIndex: 1,
      isCorrect: true,
    },
    {
      questionId: 'q2',
      topicId: 'math-fractions',
      difficulty: 'intermediate',
      selectedIndex: 0,
      correctIndex: 2,
      isCorrect: false,
    },
    {
      questionId: 'q3',
      topicId: 'math-equations',
      difficulty: 'beginner',
      selectedIndex: 1,
      correctIndex: 1,
      isCorrect: true,
    },
  ]);

  assert.equal(result.correctCount, 2);
  assert.equal(result.totalCount, 3);
  assert.equal(result.scorePercent, 67);
});

test('adaptive engine identifies weak topic, explains recommendation, and adjusts difficulty', () => {
  const attempt: AssessmentAttempt = {
    id: 'att-1',
    studentId: 'demo-student',
    subject: 'mathematics',
    grade: 7,
    mode: 'diagnostic',
    answers: [
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
        questionId: 'q-math-eq-1',
        topicId: 'math-equations',
        difficulty: 'beginner',
        selectedIndex: 1,
        correctIndex: 1,
        isCorrect: true,
      },
      {
        questionId: 'q-math-eq-2',
        topicId: 'math-equations',
        difficulty: 'intermediate',
        selectedIndex: 1,
        correctIndex: 1,
        isCorrect: true,
      },
    ],
    scorePercent: 50,
    correctCount: 2,
    totalCount: 4,
    createdAt: '2026-11-24T10:00:00.000Z',
    savedOffline: false,
  };

  const qLookup = new Map(SAMPLE_QUESTIONS.map((q) => [q.id, q]));
  const breakdown = computeTopicBreakdownFromAttempt(attempt, qLookup);
  const fracBreakdown = breakdown.find((b) => b.topicId === 'math-fractions');
  assert.equal(fracBreakdown?.accuracy, 0);

  const mastery = computeTopicMasteryMap([attempt], SAMPLE_QUESTIONS);
  const fracMastery = mastery.find((m) => m.topicId === 'math-fractions');
  const eqMastery = mastery.find((m) => m.topicId === 'math-equations');

  assert.ok(fracMastery);
  assert.ok(eqMastery);
  assert.equal(fracMastery.status, 'weak');
  assert.equal(fracMastery.recommendedDifficulty, 'beginner');
  assert.equal(eqMastery.status, 'mastered');
  assert.equal(eqMastery.recommendedDifficulty, 'advanced');

  const recs = generateAdaptiveRecommendations(mastery, SAMPLE_LESSONS, 'mathematics');
  // Mastered topic (math-equations) should NOT be recommended repeatedly
  assert.equal(recs.some((r) => r.topicId === 'math-equations'), false);
  // Weak topic (math-fractions) should be top recommendation with clear explanation
  assert.equal(recs[0].topicId, 'math-fractions');
  assert.equal(recs[0].action, 'foundation_lesson');
  assert.equal(recs[0].targetDifficulty, 'beginner');
  assert.match(recs[0].explanation.en, /0%/);
});

test('difficulty progression adapts upward as mastery rises', () => {
  assert.equal(determineRecommendedDifficulty(40, 40), 'beginner');
  assert.equal(determineRecommendedDifficulty(68, 70), 'intermediate');
  assert.equal(determineRecommendedDifficulty(88, 90), 'advanced');

  const practice = selectAdaptivePracticeQuestions(
    SAMPLE_QUESTIONS,
    'math-fractions',
    'beginner',
    2,
  );
  assert.equal(practice.length, 2);
  assert.equal(practice[0].difficulty, 'beginner');
});
