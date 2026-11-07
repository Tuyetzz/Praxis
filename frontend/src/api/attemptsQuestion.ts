// /api/attemptsquestion.ts
import { http } from "./http";
import type { AttemptQuestion } from "../types/attemptsquestion";

// List attempt questions for an attempt (with question + options)
export async function getAttemptQuestions(attemptId: string) {
  const res = await http.get<AttemptQuestion[]>(`/attempts/${attemptId}/questions`);
  return res.data;
}

// Add one attempt question
export async function addAttemptQuestion(payload: Partial<AttemptQuestion>) {
  const res = await http.post<AttemptQuestion>("/attempt-questions", payload);
  return res.data;
}

// Update one attempt question
export async function updateAttemptQuestion(id: number, payload: Partial<AttemptQuestion>) {
  const res = await http.put<AttemptQuestion>(`/attempt-questions/${id}`, payload);
  return res.data;
}

// Delete one attempt question
export async function deleteAttemptQuestion(id: number) {
  const res = await http.delete<{ success: boolean }>(`/attempt-questions/${id}`);
  return res.data;
}
