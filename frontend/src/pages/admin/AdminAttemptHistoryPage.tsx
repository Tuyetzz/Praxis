import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllAttempts, hardDeleteAttempt } from "../../api/attempts";
import type { Attempt } from "../../types/attempt";

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

export default function AdminAttemptHistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAttempts();
      setAttempts(res.data || []);
    } catch {
      setError("Unable to load attempt history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const total = attempts.length;
    const submitted = attempts.filter((item) => item.status === "submitted" || item.status === "graded").length;
    return { total, submitted };
  }, [attempts]);

  const handleDelete = async (attemptId: string) => {
    if (!window.confirm("Delete this attempt forever?")) return;
    setError(null);
    try {
      await hardDeleteAttempt(attemptId);
      setAttempts((prev) => prev.filter((item) => item.id !== attemptId));
    } catch {
      setError("Unable to delete the attempt.");
    }
  };

  return (
    <AdminLayout
      title="Attempt History"
      subtitle="Review and remove quiz attempts across the system."
    >
      {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}
      <div className="admin-panel" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Total attempts</div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{summary.total}</div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Submitted</div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{summary.submitted}</div>
        </div>
      </div>

      <div className="admin-panel">
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading attempts...</p>
        ) : attempts.length === 0 ? (
          <p style={{ color: "#64748b" }}>No attempts yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Attempt</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Started</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>#{attempt.id}</td>
                    <td>{attempt.userId}</td>
                    <td>{attempt.status}</td>
                    <td>{formatScore(attempt.score, attempt.maxScore)}</td>
                    <td>{formatDate(attempt.startedAt)}</td>
                    <td>{formatDate(attempt.submittedAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button
                          className="admin-button admin-button--danger"
                          onClick={() => handleDelete(attempt.id)}
                        >
                          Delete forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
