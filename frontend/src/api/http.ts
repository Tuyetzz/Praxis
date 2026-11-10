import axios from "axios";

const AUTH_INVALID_EVENT = "auth:invalid";

function getStoredAccessToken(): string | null {
  const token = localStorage.getItem("accessToken");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
}

function getStoredRefreshToken(): string | null {
  const token = localStorage.getItem("refreshToken");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
}

function clearStoredAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
  delete http.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event(AUTH_INVALID_EVENT));
}

// API base URL.
//
// Vite inlines VITE_* variables at BUILD time, so this is baked into the bundle.
//   dev  : unset                -> http://localhost:5000/api (backend on the host)
//   prod : VITE_API_URL=/api    -> same origin, nginx proxies /api to the backend
//
// Using a relative "/api" in production means the browser never makes a
// cross-origin request, so CORS is not involved at all.
const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// Shared axios instance
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // set true if the backend uses cookies/sessions
});

const refreshHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

// attach token on module load (survives F5)
const token = getStoredAccessToken();
if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;

// Interceptor: attach the token to every request
http.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function resolvePendingRequests(token: string | null) {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
    };

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest._retry = true;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          resolve(http(originalRequest));
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await refreshHttp.post("/auth/refresh", { refreshToken });
      const nextAccessToken = data?.data?.accessToken ?? data?.accessToken;
      const nextRefreshToken = data?.data?.refreshToken ?? data?.refreshToken;

      if (!nextAccessToken) {
        throw new Error("Refresh response missing accessToken");
      }

      localStorage.setItem("accessToken", nextAccessToken);
      if (nextRefreshToken) {
        localStorage.setItem("refreshToken", nextRefreshToken);
      }

      http.defaults.headers.common.Authorization = `Bearer ${nextAccessToken}`;
      resolvePendingRequests(nextAccessToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return http(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(null);
      clearStoredAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
