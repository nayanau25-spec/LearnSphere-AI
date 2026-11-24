import test from 'node:test';
import assert from 'node:assert/strict';
import {generateRuleBasedTutorReply} from './fallbackTutor';

test('rule-based fallback tutor returns bilingual school-level explanation', () => {
  const enReply = generateRuleBasedTutorReply({
    query: 'Explain fractions with different denominators simply',
    language: 'en',
    reason: 'Offline mode active',
  });

  assert.equal(enReply.source, 'rule_based_fallback');
  assert.equal(enReply.matchedTopicId, 'math-fractions');
  assert.match(enReply.reply, /Fractions/i);

  const knReply = generateRuleBasedTutorReply({
    query: 'ಪ್ರಶ್ನೆ ಅಭ್ಯಾಸ ಕೊಡಿ',
    language: 'kn',
    topicId: 'math-fractions',
    reason: 'Offline mode active',
  });

  assert.equal(knReply.source, 'rule_based_fallback');
  assert.match(knReply.reply, /ಸ್ಥಳೀಯ ಪಠ್ಯಕ್ರಮ/);
});
