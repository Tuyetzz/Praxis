import { http } from "./http";

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

export type Permission = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
};

export async function getPermissions() {
  const { data } = await http.get("/permissions");
  return unwrapData<Permission[]>(data);
}
