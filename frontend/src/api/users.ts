import { http } from "./http";
import type { User } from "../types/user";

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

export async function getUsers(params?: Record<string, string | number>) {
  const { data } = await http.get("/users", { params });
  return unwrapData<User[]>(data);
}
