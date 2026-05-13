// /api/questions.ts
import { http } from "./http";
import type { Question } from "../types/question";

// Lấy tất cả questions
export async function getAllQuestions() {
  const res = await http.get<Question[]>("/questions");
  return res.data;
}

// Lấy chi tiết question theo id
export async function getQuestionById(id: string | number) {
  const res = await http.get<Question>(`/questions/${id}`);
  return res.data;
}

export async function getQuestionsByChapter(chapterId: string): Promise<Question[]> {
  const res = await http.get<Question[]>(`/questions/chapter/${chapterId}`);
  return res.data;
}

// Tạo mới question
export async function createQuestion(payload: Partial<Question>) {
  const res = await http.post<Question>("/questions", payload);
  return res.data;
}

export async function createQuestionWithOptions(payload: Record<string, unknown>) {
  const res = await http.post<Question>("/questions/with-options", payload);
  return res.data;
}

// Cập nhật question
export async function updateQuestion(id: string | number, payload: Partial<Question>) {
  const res = await http.put<Question>(`/questions/${id}`, payload);
  return res.data;
}

// Xóa question
export async function deleteQuestion(id: string | number) {
  const res = await http.delete<{ success: boolean }>(`/questions/${id}`);
  return res.data;
}

// Tạo nhiều questions (batch)
export async function batchCreateQuestions(payload: Partial<Question>[]) {
  const res = await http.post<Question[]>("/questions/batch", payload);
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
