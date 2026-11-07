import { http } from "./http";
import type { Subject } from "../types/subject";

// List all subjects
export async function getSubjects(params?: Record<string, string | number | boolean>): Promise<Subject[]> {
  const res = await http.get("/subjects", { params });
  return res.data;
}

// Get a single subject by id
export async function getSubjectById(id: string | number): Promise<Subject> {
  const res = await http.get(`/subjects/${id}`);
  return res.data;
}

// Create a subject
export async function createSubject(payload: Omit<Subject, "id" | "createdAt">): Promise<Subject> {
  const res = await http.post("/subjects", payload);
  return res.data;
}

// Update a subject
export async function updateSubject(
  id: string | number,
  payload: Partial<Omit<Subject, "id" | "createdAt">>
): Promise<Subject> {
  const res = await http.put(`/subjects/${id}`, payload);
  return res.data;
}

// Delete a subject
export async function deleteSubject(id: string | number): Promise<void> {
  await http.delete(`/subjects/${id}`);
}

// Restore a soft-deleted subject
export async function restoreSubject(id: string | number): Promise<void> {
  await http.patch(`/subjects/${id}/restore`);
}
