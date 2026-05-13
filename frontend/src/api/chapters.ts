import { http } from "./http";
import type { Chapter } from "../types/chapter";

// GET /chapters?subjectId=...
export async function getChaptersBySubject(subjectId: string | number): Promise<Chapter[]> {
  const res = await http.get(`/chapters/subject/${subjectId}`);
  return res.data;
}

// (optional) lấy chi tiết 1 chapter
export async function getChapterById(id: string | number): Promise<Chapter> {
  const res = await http.get(`/chapters/${id}`);
  return res.data;
}

export async function createChapter(payload: Omit<Chapter, "id" | "createdAt">): Promise<Chapter> {
  const res = await http.post("/chapters", payload);
  return res.data;
}

export async function updateChapter(
  id: string | number,
  payload: Partial<Omit<Chapter, "id" | "createdAt">>
): Promise<Chapter> {
  const res = await http.put(`/chapters/${id}`, payload);
  return res.data;
}

export async function deleteChapter(id: string | number): Promise<void> {
  await http.delete(`/chapters/${id}`);
}

export async function getChapterQuestionCount(id: string | number): Promise<{ chapterId: string; totalQuestions: number }> {
  const res = await http.get(`/chapters/${id}/questions/count`);
  return res.data;
}
