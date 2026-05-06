import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from "../../api/auth";
import { useAuth } from "../../app/providers/AuthProvider";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null);
    try {
      await apiRegister({ name, email, password });
      setOk("Đăng ký thành công. Mời bạn đăng nhập.");
      setTimeout(() => navigate("/login"), 800);
    } catch {
      setErr("Đăng ký thất bại. Email có thể đã tồn tại.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #e0f2fe 0%, #f8fafc 45%, #ffffff 100%)",
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
          width: min(440px, 100%);
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
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
        }
        .auth-button {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: #0ea5e9;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .auth-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.22);
        }
        .auth-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 13px;
        }
        .auth-success {
          background: #ecfdf5;
          color: #047857;
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
          color: #0ea5e9;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="auth-card">
        <h1 className="auth-title">Đăng ký</h1>
        <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu luyện tập.</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <div className="auth-field">
            <label htmlFor="register-name">Họ tên</label>
            <input
              id="register-name"
              className="auth-input"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">Mật khẩu</label>
            <input
              id="register-password"
              className="auth-input"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <div className="auth-error">{err}</div>}
          {ok && <div className="auth-success">{ok}</div>}
          <button className="auth-button" type="submit">Tạo tài khoản</button>
        </form>
        <div className="auth-footer">
          Đã có tài khoản? <Link className="auth-link" to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
