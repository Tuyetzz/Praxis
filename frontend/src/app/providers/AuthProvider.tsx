import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../../types/user";
import { login as apiLogin, logout as apiLogout } from "../../api/auth";
import { http } from "../../api/http";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function clearAuthStorage() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
    delete http.defaults.headers.common.Authorization;
  }

  function getStoredUser(): User | null {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem("authUser");
      return null;
    }
  }

  function setStoredUser(nextUser: User | null) {
    if (!nextUser) {
      localStorage.removeItem("authUser");
      return;
    }
    localStorage.setItem("authUser", JSON.stringify(nextUser));
  }

  function getValidToken() {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  }

  // Khởi động: nếu có token thì dùng user đã lưu localStorage
  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      clearAuthStorage();
      setLoading(false);
      return;
    }

    const storedUser = getStoredUser();
    if (!storedUser) {
      clearAuthStorage();
      setLoading(false);
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthInvalid = () => {
      clearAuthStorage();
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:invalid", handleAuthInvalid);
    return () => window.removeEventListener("auth:invalid", handleAuthInvalid);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password });
    localStorage.setItem("accessToken", res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem("refreshToken", res.refreshToken);
    }

    // attach token cho axios
    http.defaults.headers.common.Authorization = `Bearer ${res.accessToken}`;

    setUser(res.user);
    setStoredUser(res.user);
  }


  async function logout() {
    try { await apiLogout(); } catch {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
    delete http.defaults.headers.common.Authorization;
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
