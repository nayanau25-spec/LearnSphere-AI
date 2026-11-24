import React, {useState} from 'react';
import {Bot, Send, Volume2} from 'lucide-react';
import {SAMPLE_LESSONS} from '../../domain/curriculum';
import {generateRuleBasedTutorReply} from '../../domain/fallbackTutor';
import type {
  GradeLevel,
  Language,
  TopicMastery,
  TutorMessage,
} from '../../domain/types';

interface Props {
  grade: GradeLevel;
  language: Language;
  isEffectiveOnline: boolean;
  masteryList: TopicMastery[];
  onReadAloud: (text: string) => void;
}

const QUICK_PROMPTS: Array<{
  label: {en: string; kn: string};
  query: {en: string; kn: string};
  mode: string;
}> = [
  {
    label: {en: 'Explain simply', kn: 'ಸರಳವಾಗಿ ವಿವರಿಸಿ'},
    query: {
      en: 'Explain fractions with different denominators in very simple steps.',
      kn: 'ಬೇರೆ ಬೇರೆ ಛೇದಗಳಿರುವ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಿ.',
    },
    mode: 'simple explanation',
  },
  {
    label: {en: 'Step-by-step solution', kn: 'ಹಂತ-ಹಂತದ ಪರಿಹಾರ'},
    query: {
      en: 'Give a step-by-step example for solving 2x + 5 = 13.',
      kn: '2x + 5 = 13 ಸಮೀಕರಣವನ್ನು ಹಂತ-ಹಂತವಾಗಿ ಬಿಡಿಸಿ ತೋರಿಸಿ.',
    },
    mode: 'step-by-step solution',
  },
  {
    label: {en: 'Give relatable example', kn: 'ದೈನಂದಿನ ಉದಾಹರಣೆ ಕೊಡಿ'},
    query: {
      en: 'Give a relatable rural daily-life example of xylem and phloem in plants.',
      kn: 'ಸಸ್ಯಗಳಲ್ಲಿ ಕ್ಸೈಲಂ ಮತ್ತು ಫ್ಲೋಯಂ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ ಎಂಬುದಕ್ಕೆ ಉದಾಹರಣೆ ಕೊಡಿ.',
    },
    mode: 'relatable example',
  },
  {
    label: {en: 'Practice question', kn: 'ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ ಕೊಡಿ'},
    query: {
      en: 'Give me one practice question on my weakest topic with the explanation.',
      kn: 'ನನ್ನ ದುರ್ಬಲ ವಿಷಯದ ಮೇಲೆ ಒಂದು ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ ಮತ್ತು ವಿವರಣೆ ಕೊಡಿ.',
    },
    mode: 'practice question',
  },
];

export const AiTutorPanel: React.FC<Props> = ({
  grade,
  language,
  isEffectiveOnline,
  masteryList,
  onReadAloud,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    masteryList[0]?.topicId ?? 'math-fractions',
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'tutor-welcome',
      role: 'assistant',
      content:
        language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ LearnSphere ಕಲಿಕಾ ಮಾರ್ಗದರ್ಶಿ. ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾಗ Gemini AI ಮತ್ತು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾಗ ಸ್ಥಳೀಯ ಪಠ್ಯಕ್ರಮ ಮಾರ್ಗದರ್ಶಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.'
          : 'Hello! Ask any concept question, request a step-by-step solution, or generate a quick practice question. When online and configured, responses come from Gemini; offline or without a key, the transparent Local Curriculum Fallback Tutor responds.',
      source: 'rule_based_fallback',
      reason: 'Initial welcome message',
      language,
      createdAt: new Date().toISOString(),
    },
  ]);

  const activeTopic = SAMPLE_LESSONS.find(
    (l) => l.topicId === selectedTopicId,
  );
  const weakTopicNames = masteryList
    .filter((m) => m.status === 'weak')
    .map((m) => m.topicName);

  const sendQuestion = async (questionText: string, mode?: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: TutorMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      language,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // If offline, immediately use transparent rule-based fallback
    if (!isEffectiveOnline) {
      const fb = generateRuleBasedTutorReply({
        query: trimmed,
        language,
        topicId: selectedTopicId,
        masteryList,
        reason: 'Offline Mode active — answered using local curriculum bank.',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: fb.reply,
          source: 'rule_based_fallback',
          reason: fb.reason,
          language,
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/tutor/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          query: trimmed,
          language,
          topicName: activeTopic?.topicName.en,
          grade,
          weakTopics: weakTopicNames,
          mode,
        }),
      });

      const data = (await res.json()) as
        | {source: 'gemini'; model: string; reply: string}
        | {source: 'fallback_required'; reason: string; error?: string};

      if (res.ok && data.source === 'gemini') {
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            source: 'gemini',
            model: data.model,
            language,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        const reason =
          data.source === 'fallback_required'
            ? data.reason
            : 'Tutor service unreachable';
        const fb = generateRuleBasedTutorReply({
          query: trimmed,
          language,
          topicId: selectedTopicId,
          masteryList,
          reason,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: fb.reply,
            source: 'rule_based_fallback',
            reason: fb.reason,
            language,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      const fb = generateRuleBasedTutorReply({
        query: trimmed,
        language,
        topicId: selectedTopicId,
        masteryList,
        reason: 'Network error reaching server — local curriculum fallback used.',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: fb.reply,
          source: 'rule_based_fallback',
          reason: fb.reason,
          language,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Personalised Tutor Context
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Gemini responses and Local Rule-Based Fallback answers are always
            explicitly labelled.
          </p>

          <label
            htmlFor="tutor-topic-select"
            className="mt-4 block text-xs font-semibold text-slate-700"
          >
            Focus Topic
          </label>
          <select
            id="tutor-topic-select"
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {SAMPLE_LESSONS.map((lesson) => (
              <option key={lesson.topicId} value={lesson.topicId}>
                {lesson.topicName[language]}
              </option>
            ))}
          </select>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-700">
              Quick Study Actions
            </p>
            <div className="mt-2.5 flex flex-col gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    void sendQuestion(qp.query[language], qp.mode)
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-800 transition-colors hover:bg-blue-50 hover:text-blue-900"
                >
                  {qp.label[language]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[540px] flex-col rounded-xl border border-slate-200 bg-white lg:col-span-8">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-900">
              LearnSphere Tutor ({language === 'kn' ? 'ಕನ್ನಡ' : 'English'})
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {isEffectiveOnline
              ? 'Server Gemini + Local Fallback Ready'
              : 'Offline Mode · Local Rule-Based Tutor'}
          </span>
        </div>

        <div
          data-testid="tutor-messages"
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="mb-2 flex items-center justify-between gap-4 border-b border-slate-200 pb-1.5 text-xs">
                    <span
                      className={`font-semibold ${
                        msg.source === 'gemini'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {msg.source === 'gemini'
                        ? `Gemini AI (${msg.model ?? 'gemini-4-hydrogen'})`
                        : 'Local Rule-Based Fallback Tutor'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onReadAloud(msg.content)}
                      aria-label="Read tutor reply aloud"
                      className="text-slate-500 hover:text-slate-900"
                    >
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
                {msg.content}
                {msg.role === 'assistant' &&
                  msg.source === 'rule_based_fallback' &&
                  msg.reason && (
                    <p className="mt-2 border-t border-slate-200 pt-1.5 text-xs text-slate-500">
                      Source note: {msg.reason}
                    </p>
                  )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-slate-500">
              Preparing school-level explanation...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendQuestion(input);
          }}
          className="flex items-center gap-2 border-t border-slate-200 p-4"
        >
          <label htmlFor="tutor-question-input" className="sr-only">
            Ask the tutor a question
          </label>
          <input
            id="tutor-question-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'kn'
                ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
                : 'Ask a question about fractions, circuits, or grammar...'
            }
            className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-slate-300"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Ask
          </button>
        </form>
      </div>
    </div>
  );
};
