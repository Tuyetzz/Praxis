import { http } from "./http";
import type { TypingResult } from "../types/typingResult";

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

export async function createTypingResult(payload: TypingResult) {
  const { data } = await http.post("/typing-results", payload);
  return unwrapData<TypingResult>(data);
}

export async function getMyTypingResults(): Promise<TypingResult[]> {
  const { data } = await http.get("/typing-results/mine");
  return unwrapData<TypingResult[]>(data);
}
