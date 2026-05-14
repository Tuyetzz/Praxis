// /api/options.ts
import { http } from "./http";
import type { Option } from "../types/options";

// Lấy danh sách options của 1 question
export async function getOptionsByQuestion(
  questionId: string | number,
  params?: Record<string, string | number | boolean>
) {
  const res = await http.get<Option[]>(`/options/question/${questionId}`, { params });
  return res.data;
}

// Lấy chi tiết 1 option theo id
export async function getOptionById(id: string | number) {
  const res = await http.get<Option>(`/options/${id}`);
  return res.data;
}

// Tạo option mới cho 1 question
export async function createOption(questionId: string | number, payload: Partial<Option>) {
  const res = await http.post<Option>("/options", { ...payload, questionId });
  return res.data;
}

// Cập nhật option
export async function updateOption(id: string | number, payload: Partial<Option>) {
  const res = await http.put<Option>(`/options/${id}`, payload);
  return res.data;
}

// Xóa option
export async function deleteOption(id: string | number) {
  const res = await http.delete<{ success: boolean }>(`/options/${id}`);
  return res.data;
}

// Khôi phục option
export async function restoreOption(id: string | number) {
  const res = await http.patch<{ success: boolean }>(`/options/${id}/restore`);
  return res.data;
}
