// /api/ai.ts
import { http } from "./http";
import type { QuestionType } from "../types/question";

/**
 * AI quiz generation.
 *
 * NOTE: the backend endpoint (POST /api/ai/generate-quiz) is not implemented
 * yet - see TODO.md section 2. This module defines the contract the frontend
 * expects so the UI can be built now; the backend just has to match it.
 *
 * Until then the page falls back to a local mock when the request 404s, so the
 * flow can be exercised end to end. See AI_BACKEND_READY in AiQuizPage.tsx.
 */

export type GenerateQuizRequest = {
  /** Free-form topic or pasted source text (NotebookLM-style input). */
  topic: string;
  /** How many questions to generate. */
  numQuestions: number;
  /** Target chapter the questions will be saved into. */
  subjectId: string;
  chapterId: string;
  /** Let the model pick per-question types when omitted. */
  questionTypes?: QuestionType[];
  difficulty?: 1 | 2 | 3;
  language?: string;
};

export type GeneratedOption = {
  text: string;
  isCorrect: boolean;
  order?: number;
};

export type GeneratedQuestion = {
  text: string;
  type: QuestionType;
  explanation?: string;
  difficulty?: number;
  points?: number;
  options: GeneratedOption[];
};

export type GenerateQuizResponse = {
  questions: GeneratedQuestion[];
  /** Optional provider metadata, useful for debugging. */
  model?: string;
  usage?: { promptTokens?: number; completionTokens?: number };
};

export async function generateQuiz(payload: GenerateQuizRequest): Promise<GenerateQuizResponse> {
  const res = await http.post<GenerateQuizResponse>("/ai/generate-quiz", payload);
  return res.data;
}
