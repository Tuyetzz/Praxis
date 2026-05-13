import { http } from "./http";
import type { TypingText } from "../types/typingText";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope && maybeEnvelope.data) {
    return maybeEnvelope.data;
  }
  return payload as T;
}

export type CreateTypingTextPayload = Pick<
  TypingText,
  "title" | "content" | "difficulty" | "language" | "isPublic"
> & {
  isDefault?: boolean;
  sourceType?: string;
};

export type UpdateTypingTextPayload = Partial<CreateTypingTextPayload>;

export async function getTypingTexts(params?: Record<string, string | number>) {
  const { data } = await http.get("/typing-texts", { params });
  return unwrapData<TypingText[]>(data);
}

export async function getPublicTypingTexts() {
  const { data } = await http.get("/typing-texts/public");
  return unwrapData<TypingText[]>(data);
}

export async function getMyTypingTexts() {
  const { data } = await http.get("/typing-texts/mine");
  return unwrapData<TypingText[]>(data);
}

export async function getTypingText(id: string) {
  const { data } = await http.get(`/typing-texts/${id}`);
  return unwrapData<TypingText>(data);
}

export async function createTypingText(payload: CreateTypingTextPayload) {
  const { data } = await http.post("/typing-texts", payload);
  return unwrapData<TypingText>(data);
}

export async function updateTypingText(id: string, payload: UpdateTypingTextPayload) {
  const { data } = await http.put(`/typing-texts/${id}`, payload);
  return unwrapData<TypingText>(data);
}

export async function deleteTypingText(id: string) {
  await http.delete(`/typing-texts/${id}`);
}
