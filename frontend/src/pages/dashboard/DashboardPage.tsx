import { Link } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../app/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #ecfeff 0%, #fdf4ff 45%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .dashboard-wrap {
          max-width: 1040px;
          margin: 28px auto 60px;
          padding: 0 20px 48px;
        }
        .dashboard-hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          align-items: center;
          margin-bottom: 28px;
        }
        .dashboard-title {
          font-size: clamp(28px, 4vw, 44px);
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .dashboard-subtitle {
          margin: 0;
          font-size: 16px;
          color: #334155;
        }
        .dashboard-panel {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          border-radius: 18px;
          padding: 20px 22px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
        }
        .dashboard-panel h3 {
          margin: 0 0 8px;
          font-size: 18px;
        }
        .dashboard-panel p {
          margin: 0;
          color: rgba(248, 250, 252, 0.72);
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 22px;
        }
        .action-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 18px 18px 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 32px rgba(14, 116, 144, 0.16);
          border-color: #99f6e4;
        }
        .action-title {
          margin: 0 0 6px;
          font-size: 18px;
          color: #0f172a;
        }
        .action-text {
          margin: 0 0 14px;
          color: #475569;
          font-size: 14px;
        }
        .action-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: #0f766e;
          text-decoration: none;
        }
        .action-link:hover {
          color: #0e7490;
        }
      `}</style>

      <main className="dashboard-wrap">
        <section className="dashboard-hero">
          <div>
            <h1 className="dashboard-title">Homepage Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome {user?.name}. Jump back into quizzes, typing practice, or admin tools.
            </p>
          </div>
          <div className="dashboard-panel">
            <h3>Your next move</h3>
            <p>Pick a path and keep your momentum. Everything is one click away.</p>
          </div>
        </section>

        <section className="action-grid">
          <div className="action-card">
            <h3 className="action-title">Start Quiz</h3>
            <p className="action-text">Choose subject, chapter, and exam settings.</p>
            <Link className="action-link" to="/subjects">
              Go to subjects →
            </Link>
          </div>

          <div className="action-card">
            <h3 className="action-title">Typing Practice</h3>
            <p className="action-text">Select a typing text and track WPM + accuracy.</p>
            <Link className="action-link" to="/practice/select">
              Go to typing texts →
            </Link>
          </div>

          <div className="action-card">
            <h3 className="action-title">Quiz History</h3>
            <p className="action-text">Review your quiz attempts and clean old sessions.</p>
            <Link className="action-link" to="/attempts/history">
              View attempt history →
            </Link>
          </div>

          <div className="action-card">
            <h3 className="action-title">Flashcards</h3>
            <p className="action-text">Manage decks and study cards with flip mode.</p>
            <Link className="action-link" to="/flashcard-decks">
              Open flashcards →
            </Link>
          </div>

          <div className="action-card">
            <h3 className="action-title">Admin Area</h3>
            <p className="action-text">Manage subjects, chapters, and questions.</p>
            <Link className="action-link" to="/admin/subjects">
              Open admin →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
