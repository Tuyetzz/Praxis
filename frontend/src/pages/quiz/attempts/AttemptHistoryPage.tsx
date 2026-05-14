import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/AppHeader";
import { getMyAttempts, hardDeleteAttempt } from "../../../api/attempts";
import type { Attempt } from "../../../types/attempt";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatScore(score: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) return "-";
  return `${score} / ${maxScore}`;
}

export default function AttemptHistoryPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAttempts() {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyAttempts();
        if (!active) return;
        setAttempts(res.data || []);
      } catch {
        if (active) setError("Khong tai duoc lich su bai thi.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAttempts();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = attempts.length;
    const submitted = attempts.filter((item) => item.status === "submitted" || item.status === "graded").length;
    return { total, submitted };
  }, [attempts]);

  async function handleDelete(attemptId: string) {
    if (!window.confirm("Xoa vinh vien lich su bai thi nay?")) return;
    try {
      await hardDeleteAttempt(attemptId);
      setAttempts((prev) => prev.filter((item) => item.id !== attemptId));
    } catch {
      setError("Khong xoa duoc lich su bai thi.");
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Dang tai lich su...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 10%, #e0f2fe 0%, #fef9c3 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .attempt-wrap {
          max-width: 1040px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .attempt-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 6px;
        }
        .attempt-subtitle {
          margin: 0 0 16px;
          color: #475569;
        }
        .attempt-grid {
          display: grid;
          gap: 12px;
        }
        .attempt-card {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 16px 18px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          display: grid;
          gap: 10px;
        }
        .attempt-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: #f1f5f9;
          color: #334155;
        }
        .attempt-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .attempt-button {
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
        }
        .attempt-button--danger {
          background: #ef4444;
        }
        .attempt-summary {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .attempt-summary-card {
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 12px 16px;
          min-width: 160px;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
        }
      `}</style>
      <main className="attempt-wrap">
        <h1 className="attempt-title">Lich su bai thi</h1>
        <p className="attempt-subtitle">Xem lai cac lan lam bai cua ban.</p>

        {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}

        <div className="attempt-summary">
          <div className="attempt-summary-card">
            <div style={{ color: "#64748b", fontSize: 13 }}>Tong lan</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{summary.total}</div>
          </div>
          <div className="attempt-summary-card">
            <div style={{ color: "#64748b", fontSize: 13 }}>Da nop</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{summary.submitted}</div>
          </div>
        </div>

        <section className="attempt-grid">
          {attempts.map((attempt) => (
            <article key={attempt.id} className="attempt-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Attempt #{attempt.id}</div>
                  <div style={{ color: "#64748b" }}>Mode: {attempt.mode}</div>
                </div>
                <span className="attempt-pill">{attempt.status}</span>
              </div>
              <div style={{ display: "grid", gap: 6, color: "#475569" }}>
                <div>Started: {formatDate(attempt.startedAt)}</div>
                <div>Submitted: {formatDate(attempt.submittedAt)}</div>
                <div>Score: {formatScore(attempt.score, attempt.maxScore)}</div>
              </div>
              <div className="attempt-actions">
                <button
                  className="attempt-button"
                  onClick={() =>
                    navigate(
                      attempt.status === "submitted" || attempt.status === "graded"
                        ? `/attempts/${attempt.id}/result`
                        : `/attempts/${attempt.id}`
                    )
                  }
                >
                  View details
                </button>
                <button
                  className="attempt-button attempt-button--danger"
                  onClick={() => handleDelete(attempt.id)}
                >
                  Delete forever
                </button>
              </div>
            </article>
          ))}
          {attempts.length === 0 && <div>Chua co lich su bai thi.</div>}
        </section>
      </main>
    </div>
  );
}
