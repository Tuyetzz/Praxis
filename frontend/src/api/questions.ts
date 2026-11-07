// /api/questions.ts
import { http } from "./http";
import type { Question, QuestionType } from "../types/question";
import type { Option } from "../types/options";

// List all questions
export async function getAllQuestions(params?: Record<string, string | number | boolean>) {
  const res = await http.get<Question[]>("/questions", { params });
  return res.data;
}

// Get a single question by id
export async function getQuestionById(id: string | number) {
  const res = await http.get<Question>(`/questions/${id}`);
  return res.data;
}

export async function getQuestionsByChapter(
  chapterId: string,
  params?: Record<string, string | number | boolean>
): Promise<Question[]> {
  const res = await http.get<Question[]>(`/questions/chapter/${chapterId}`, { params });
  return res.data;
}

// Create a question
export async function createQuestion(payload: Partial<Question>) {
  const res = await http.post<Question>("/questions", payload);
  return res.data;
}

export async function createQuestionWithOptions(payload: Record<string, unknown>) {
  const res = await http.post<Question>("/questions/with-options", payload);
  return res.data;
}

// Update a question
export async function updateQuestion(id: string | number, payload: Partial<Question>) {
  const res = await http.put<Question>(`/questions/${id}`, payload);
  return res.data;
}

// Delete a question
export async function deleteQuestion(id: string | number) {
  const res = await http.delete<{ success: boolean }>(`/questions/${id}`);
  return res.data;
}

// Restore a soft-deleted question
export async function restoreQuestion(id: string | number) {
  const res = await http.patch<{ success: boolean }>(`/questions/${id}/restore`);
  return res.data;
}

/**
 * Create several questions at once.
 *
 * Note the payload shape: the backend expects an object wrapper
 * ({ mode, subjectId, chapterId, type, items }), not a bare array.
 * See backend/src/usecases/question/AddBatchQuestions.js.
 */
export type BatchQuestionItem = {
  text: string;
  type?: QuestionType;
  explanation?: string | null;
  difficulty?: number;
  points?: number;
  media?: unknown[] | null;
  tags?: string[];
  options?: Array<{
    text: string;
    isCorrect?: boolean;
    media?: string | null;
    order?: number;
  }>;
};

export type BatchCreateQuestionsPayload = {
  mode?: "all-or-nothing" | "continue-on-error";
  subjectId: string;
  chapterId: string;
  type?: QuestionType;
  items: BatchQuestionItem[];
};

export type BatchCreateQuestionsResponse = {
  mode: string;
  created: number;
  errors?: Array<{ index: number; error: string }>;
  data: Array<{ question: Question; options: Option[] }>;
};

export async function batchCreateQuestions(
  payload: BatchCreateQuestionsPayload
): Promise<BatchCreateQuestionsResponse> {
  const res = await http.post<BatchCreateQuestionsResponse>("/questions/batch", payload);
  return res.data;
}

type ImportQuestionsParams = {
  file: File;
  subjectId: string;
  chapterId: string;
  fileType?: "kahoot" | "quizizz";
};

export async function importQuestionsFromFile(params: ImportQuestionsParams) {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("subjectId", params.subjectId);
  formData.append("chapterId", params.chapterId);
  if (params.fileType) {
    formData.append("fileType", params.fileType);
  }

  const res = await http.post("/questions/import", formData);
  return res.data;
}
