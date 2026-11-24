import {SAMPLE_LESSONS, SAMPLE_QUESTIONS} from './curriculum';
import type {Language, TopicMastery} from './types';

export interface FallbackTutorInput {
  query: string;
  language: Language;
  topicId?: string;
  masteryList?: TopicMastery[];
  reason?: string;
}

export interface FallbackTutorResult {
  reply: string;
  source: 'rule_based_fallback';
  matchedTopicId?: string;
  reason: string;
}

/**
 * Transparent local rule-based tutor used whenever Gemini is unreachable
 * (offline mode, network error, or missing API key).
 * Uses only local curriculum definitions, worked examples, and practice questions.
 */
export function generateRuleBasedTutorReply(
  input: FallbackTutorInput,
): FallbackTutorResult {
  const qLower = input.query.toLowerCase();
  const lang = input.language;

  // Match topic by explicit topicId or keyword scan
  let matchedLesson = input.topicId
    ? SAMPLE_LESSONS.find((l) => l.topicId === input.topicId)
    : undefined;

  if (!matchedLesson) {
    if (
      qLower.includes('fraction') ||
      qLower.includes('denominator') ||
      qLower.includes('ratio') ||
      qLower.includes('ಭಿನ್ನರಾಶಿ')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'math-fractions');
    } else if (
      qLower.includes('equation') ||
      qLower.includes('algebra') ||
      qLower.includes('solve') ||
      qLower.includes('ಸಮೀಕರಣ')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'math-equations');
    } else if (
      qLower.includes('triangle') ||
      qLower.includes('angle') ||
      qLower.includes('perimeter') ||
      qLower.includes('ತ್ರಿಭುಜ')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'math-geometry');
    } else if (
      qLower.includes('plant') ||
      qLower.includes('xylem') ||
      qLower.includes('phloem') ||
      qLower.includes('photosynthesis') ||
      qLower.includes('ಸಸ್ಯ')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'sci-plants');
    } else if (
      qLower.includes('circuit') ||
      qLower.includes('electric') ||
      qLower.includes('conductor') ||
      qLower.includes('ವಿದ್ಯುತ್')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'sci-circuits');
    } else if (
      qLower.includes('matter') ||
      qLower.includes('solid') ||
      qLower.includes('evaporation') ||
      qLower.includes('ದ್ರವ್ಯ')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'sci-matter');
    } else if (
      qLower.includes('tense') ||
      qLower.includes('verb') ||
      qLower.includes('grammar')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'eng-tenses');
    } else if (
      qLower.includes('passage') ||
      qLower.includes('reading') ||
      qLower.includes('comprehension')
    ) {
      matchedLesson = SAMPLE_LESSONS.find(
        (l) => l.topicId === 'eng-comprehension',
      );
    } else if (
      qLower.includes('because') ||
      qLower.includes('although') ||
      qLower.includes('connector')
    ) {
      matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === 'eng-structure');
    }
  }

  // Fallback to weakest topic if user asks for general revision/practice
  if (!matchedLesson && input.masteryList && input.masteryList.length > 0) {
    const weakest = [...input.masteryList].sort(
      (a, b) => a.masteryScore - b.masteryScore,
    )[0];
    matchedLesson = SAMPLE_LESSONS.find((l) => l.topicId === weakest.topicId);
  }

  if (!matchedLesson) {
    matchedLesson = SAMPLE_LESSONS[0];
  }

  const topicQuestions = SAMPLE_QUESTIONS.filter(
    (q) => q.topicId === matchedLesson.topicId,
  );
  const sampleQ = topicQuestions[0];
  const firstSection = matchedLesson.sections[0];

  const wantsPractice =
    qLower.includes('practice') ||
    qLower.includes('question') ||
    qLower.includes('quiz') ||
    qLower.includes('ಪ್ರಶ್ನೆ');
  const wantsSummary =
    qLower.includes('summar') ||
    qLower.includes('revise') ||
    qLower.includes('ಸಾರಾಂಶ');

  if (lang === 'kn') {
    if (wantsPractice && sampleQ) {
      return {
        source: 'rule_based_fallback',
        matchedTopicId: matchedLesson.topicId,
        reason: input.reason ?? 'Local offline curriculum engine',
        reply: [
          `[ಸ್ಥಳೀಯ ಪಠ್ಯಕ್ರಮ ಮಾರ್ಗದರ್ಶಿ] ವಿಷಯ: ${matchedLesson.topicName.kn}`,
          '',
          `ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ: ${sampleQ.prompt.kn}`,
          sampleQ.options.map((o, i) => `${i + 1}) ${o.kn}`).join('\n'),
          '',
          `ವಿವರಣೆ: ${sampleQ.explanation.kn}`,
        ].join('\n'),
      };
    }

    if (wantsSummary) {
      return {
        source: 'rule_based_fallback',
        matchedTopicId: matchedLesson.topicId,
        reason: input.reason ?? 'Local offline curriculum engine',
        reply: [
          `[ಸ್ಥಳೀಯ ಪಠ್ಯಕ್ರಮ ಸಾರಾಂಶ] ${matchedLesson.title.kn}`,
          matchedLesson.summary.kn,
          '',
          'ಮುಖ್ಯ ಅಂಶಗಳು:',
          ...matchedLesson.keyTakeaways.map((k) => `• ${k.kn}`),
        ].join('\n'),
      };
    }

    return {
      source: 'rule_based_fallback',
      matchedTopicId: matchedLesson.topicId,
      reason: input.reason ?? 'Local offline curriculum engine',
      reply: [
        `[ಸ್ಥಳೀಯ ಪಠ್ಯಕ್ರಮ ಮಾರ್ಗದರ್ಶಿ] ${matchedLesson.title.kn}`,
        '',
        firstSection.body.kn,
        firstSection.example ? `\n${firstSection.example.kn}` : '',
        '',
        `ಪ್ರಮುಖ ನಿಯಮ: ${matchedLesson.keyTakeaways[0]?.kn ?? ''}`,
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }

  // English response
  if (wantsPractice && sampleQ) {
    return {
      source: 'rule_based_fallback',
      matchedTopicId: matchedLesson.topicId,
      reason: input.reason ?? 'Local offline curriculum engine',
      reply: [
        `Topic: ${matchedLesson.topicName.en}`,
        '',
        `Practice Question (${sampleQ.difficulty}): ${sampleQ.prompt.en}`,
        sampleQ.options.map((o, i) => `${i + 1}. ${o.en}`).join('\n'),
        '',
        `Step-by-step Answer: ${sampleQ.options[sampleQ.correctIndex].en} — ${sampleQ.explanation.en}`,
      ].join('\n'),
    };
  }

  if (wantsSummary) {
    return {
      source: 'rule_based_fallback',
      matchedTopicId: matchedLesson.topicId,
      reason: input.reason ?? 'Local offline curriculum engine',
      reply: [
        `Lesson Summary — ${matchedLesson.title.en}`,
        matchedLesson.summary.en,
        '',
        'Key Takeaways:',
        ...matchedLesson.keyTakeaways.map((k) => `• ${k.en}`),
      ].join('\n'),
    };
  }

  return {
    source: 'rule_based_fallback',
    matchedTopicId: matchedLesson.topicId,
    reason: input.reason ?? 'Local offline curriculum engine',
    reply: [
      `${matchedLesson.title.en} (${matchedLesson.topicName.en})`,
      '',
      `Concept: ${firstSection.body.en}`,
      firstSection.example ? `\nRelatable Example: ${firstSection.example.en}` : '',
      '',
      `Remember: ${matchedLesson.keyTakeaways[0]?.en ?? matchedLesson.summary.en}`,
    ]
      .filter(Boolean)
      .join('\n'),
  };
}
