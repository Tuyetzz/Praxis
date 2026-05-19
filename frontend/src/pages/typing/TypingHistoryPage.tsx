import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { getMyTypingResults, hardDeleteTypingResult } from "../../api/typingResults";
import type { TypingResult } from "../../types/typingResult";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds < 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default function TypingHistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResults() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyTypingResults();
        if (!active) return;
        setResults(data);
      } catch {
        if (active) setError("Cant load typing history.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResults();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    if (results.length === 0) return { avgWpm: 0, avgAcc: 0 };
    const sumWpm = results.reduce((sum, item) => sum + (item.wpm || 0), 0);
    const sumAcc = results.reduce((sum, item) => sum + (item.accuracy || 0), 0);
    return {
      avgWpm: Math.round(sumWpm / results.length),
      avgAcc: Math.round(sumAcc / results.length),
    };
  }, [results]);

  async function handleDelete(resultId?: string) {
    if (!resultId) return;
    if (!window.confirm("Permanently delete this typing history?")) return;
    try {
      await hardDeleteTypingResult(resultId);
      setResults((prev) => prev.filter((item) => item.id !== resultId));
    } catch {
      setError("Cant delete typing history.");
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading history...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 10%, #ecfeff 0%, #f8fafc 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .history-wrap {
          max-width: 1020px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .history-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 6px;
        }
        .history-subtitle {
          margin: 0 0 16px;
          color: #475569;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }
        .summary-card {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 14px 16px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .history-grid {
          display: grid;
          gap: 12px;
        }
        .history-card {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 16px 18px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .history-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: #ecfeff;
          color: #0f766e;
        }
        .history-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .history-button {
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
        }
        .history-hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
          align-items: center;
          margin-bottom: 18px;
        }
        .history-panel {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.16);
        }
      `}</style>
      <main className="history-wrap">
        <div className="history-hero">
          <div>
            <h1 className="history-title">Typing History</h1>
            <p className="history-subtitle">Overview of your typing results.</p>
          </div>
          <div className="history-panel">
            <div style={{ fontWeight: 600, fontSize: 16 }}>Total progress</div>
            <div style={{ color: "rgba(248, 250, 252, 0.7)" }}>
              Track your speed and accuracy over time.
            </div>
          </div>
        </div>

        {error && <div className="history-error">{error}</div>}

        <div className="summary-grid">
          <div className="summary-card">
            <div className="history-pill">Average WPM</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals.avgWpm}</div>
          </div>
          <div className="summary-card">
            <div className="history-pill">Average Accuracy</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals.avgAcc}%</div>
          </div>
          <div className="summary-card">
            <div className="history-pill">Total Sessions</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{results.length}</div>
          </div>
        </div>

        <section className="history-grid">
          {results.map((item) => (
            <article key={item.id || `${item.textId}-${item.createdAt}`} className="history-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>WPM: {item.wpm}</div>
                  <div>Accuracy: {item.accuracy}%</div>
                </div>
                <div style={{ textAlign: "right", color: "#64748b" }}>
                  <div>{formatDate(item.createdAt)}</div>
                  <div>Duration: {formatDuration(item.durationSeconds)}</div>
                </div>
              </div>
              {item.errorTags && Object.keys(item.errorTags).length > 0 ? (
                <div style={{ marginTop: 10, color: "#475569" }}>
                  Error tags: {Object.entries(item.errorTags)
                    .map(([key, count]) => `${key}(${count})`)
                    .join(", ")}
                </div>
              ) : (
                <div style={{ marginTop: 10, color: "#94a3b8" }}>No error tags recorded.</div>
              )}
              <div style={{ marginTop: 12 }}>
                <button
                  className="history-button"
                  style={{ background: "#ef4444" }}
                  onClick={() => handleDelete(item.id)}
                >
                  Delete forever
                </button>
              </div>
            </article>
          ))}
          {results.length === 0 && <div>No typing history available.</div>}
        </section>

        <div style={{ marginTop: 18 }}>
          <button className="history-button" onClick={() => navigate("/practice/select")}>Back to texts</button>
        </div>
      </main>
    </div>
  );
}
