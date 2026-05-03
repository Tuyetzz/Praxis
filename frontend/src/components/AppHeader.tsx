import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          to={user ? "/dashboard" : "/login"}
          style={{ fontWeight: 700, color: "#111827", textDecoration: "none" }}
        >
          TracNghiem
        </Link>

        {user && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/subjects">Subjects</Link>
            <Link to="/flashcard-decks">Flashcards</Link>
            <Link to="/practice/select">Typing</Link>
            <Link to="/admin/subjects">Admin</Link>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user && (
          <>
            <span style={{ color: "#374151" }}>Hello, {user.name}</span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
