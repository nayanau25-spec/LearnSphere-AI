import {GoogleGenAI, ThinkingLevel} from '@google/genai';

export interface ServerTutorRequest {
  query: string;
  language: 'en' | 'kn';
  topicName?: string;
  grade?: number;
  weakTopics?: string[];
  mode?: string;
}

export type ServerTutorResult =
  | {
      source: 'gemini';
      model: string;
      reply: string;
    }
  | {
      source: 'fallback_required';
      reason: string;
      error?: string;
    };

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

export async function askGeminiTutor(
  req: ServerTutorRequest,
): Promise<ServerTutorResult> {
  if (!isGeminiConfigured()) {
    return {
      source: 'fallback_required',
      reason: 'GEMINI_API_KEY is not configured in the server environment.',
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const langInstruction =
      req.language === 'kn'
        ? 'Respond clearly in simple Kannada (ಕನ್ನಡ) with key technical terms in brackets so a rural school student in Karnataka can easily understand.'
        : 'Respond in clear, simple English suitable for a rural middle-school student (Grades 6–8).';

    const contextLines = [
      req.grade ? `Student Grade: ${req.grade}` : '',
      req.topicName ? `Current Topic: ${req.topicName}` : '',
      req.weakTopics && req.weakTopics.length > 0
        ? `Topics needing support: ${req.weakTopics.join(', ')}`
        : '',
      req.mode ? `Requested help style: ${req.mode}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const systemInstruction = [
      'You are LearnSphere AI Tutor, a supportive school teacher for students in Grades 6–8 in rural communities.',
      langInstruction,
      'Use step-by-step explanations, everyday rural or household analogies, and keep responses concise (under 180 words) so they load quickly on low-bandwidth screens.',
      'Never use jargon without explaining it. End with one short check-for-understanding tip or question.',
    ].join(' ');

    const prompt = contextLines
      ? `${contextLines}\n\nStudent Question: ${req.query}`
      : req.query;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {thinkingLevel: ThinkingLevel.LOW},
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return {
        source: 'fallback_required',
        reason: 'Gemini returned an empty response.',
      };
    }

    return {
      source: 'gemini',
      model: 'gemini-4-hydrogen',
      reply,
    };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Gemini API call failed.';
    return {
      source: 'fallback_required',
      reason: 'Gemini API unavailable; switched to transparent local fallback.',
      error: msg,
    };
  }
}
