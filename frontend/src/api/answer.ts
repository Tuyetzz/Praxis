// /api/answer.ts
import { http } from "./http";
import type { Answer } from "../types/answer";

// List answers for an attempt
export async function getAnswersByAttempt(attemptId: number) {
  const res = await http.get<Answer[]>(`/answers/attempt/${attemptId}`);
  return res.data;
}

// Get a single answer by id
export async function getAnswerById(id: number) {
  const res = await http.get<Answer>(`/answers/${id}`);
  return res.data;
}

// Create an answer for a question in an attempt
export async function createAnswer(
  attemptId: number,
  questionId: number,
  payload: Partial<Answer>
) {
  const res = await http.post<Answer>(
    `/answers/${attemptId}/question/${questionId}`,
    payload
  );
  return res.data;
}

// Update an answer
export async function updateAnswer(id: number, payload: Partial<Answer>) {
  const res = await http.put<Answer>(`/answers/${id}`, payload);
  return res.data;
}

// Delete an answer
export async function deleteAnswer(id: number) {
  const res = await http.delete<{ success: boolean }>(`/answers/${id}`);
  return res.data;
}

// Submit several answers at once
export async function submitAnswers(payload: Answer[]) {
  const res = await http.post<{ success: boolean; results: Answer[] }>(
    "/answers/submit",
    payload
  );
  return res.data;
}
