import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      setErr("Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #f5f3ff 0%, #e2e8f0 45%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
        color: "#0f172a",
      }}
    >
      <style>{`
        .auth-card {
          width: min(420px, 100%);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
          padding: 28px 26px 30px;
          border: 1px solid #e2e8f0;
        }
        .auth-title {
          margin: 0 0 6px;
          font-size: 28px;
        }
        .auth-subtitle {
          margin: 0 0 18px;
          color: #475569;
          font-size: 14px;
        }
        .auth-field {
          display: grid;
          gap: 8px;
        }
        .auth-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5f5;
          background: #f8fafc;
          font-size: 14px;
        }
        .auth-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }
        .auth-button {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: #4f46e5;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .auth-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
        }
        .auth-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 13px;
        }
        .auth-footer {
          margin-top: 12px;
          font-size: 14px;
          color: #475569;
        }
        .auth-link {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="auth-card">
        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Chào mừng quay lại. Nhập thông tin để tiếp tục.</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Mật khẩu</label>
            <input
              id="login-password"
              className="auth-input"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <div className="auth-error">{err}</div>}
          <button className="auth-button" disabled={loading} type="submit">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <div className="auth-footer">
          Chưa có tài khoản? <Link className="auth-link" to="/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}
