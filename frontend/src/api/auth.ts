import { http } from "./http";
import type { User } from "../types/user";

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await http.post("/auth/login", payload);
  const loginData = unwrapData<LoginResponse>(data);

  if (!loginData?.accessToken) {
    throw new Error("Login response does not include accessToken");
  }

  return loginData;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await http.post("/auth/register", payload);
  return unwrapData<User>(data);
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");
  await http.post("/auth/logout", refreshToken ? { refreshToken } : undefined);
}
