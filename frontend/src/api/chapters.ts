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

export async function getChapterQuestionCount(id: string | number): Promise<{ chapterId: string; totalQuestions: number }> {
  const res = await http.get(`/chapters/${id}/questions/count`);
  return res.data;
}
