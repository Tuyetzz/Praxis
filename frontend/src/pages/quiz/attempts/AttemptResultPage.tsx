import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttemptGrade, hardDeleteAttempt, type AttemptGradeResponse } from "../../../api/attempts";
import AppHeader from "../../../components/AppHeader";

export default function AttemptResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attemptId = id || "";

  const [result, setResult] = useState<AttemptGradeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResult() {
      if (!attemptId) {
        setError("Thiếu attempt id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getAttemptGrade(attemptId);
        if (!active) return;
        setResult(data);
      } catch (e: unknown) {
        const message =
          typeof e === "object" &&
          e &&
          "response" in e &&
          typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : "Không tải được kết quả.";
        if (active) setError(message || "Không tải được kết quả.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResult();
    return () => {
      active = false;
    };
  }, [attemptId]);

  if (loading) return <div style={{ padding: 20 }}>Đang tải kết quả...</div>;

  async function handleDeleteAttempt() {
    if (!attemptId) return;
    if (!window.confirm("Xoa vinh vien lich su bai thi nay?")) return;
    try {
      await hardDeleteAttempt(attemptId);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Khong xoa duoc lich su bai thi.");
    }
  }

  function formatAnswer(answer: AttemptGradeResponse["detailedAnswers"][number]["selectedAnswer"]) {
    if (!answer) return "-";
    if (typeof answer === "string") return answer;
    if (Array.isArray(answer)) {
      return answer.map((item) => item.text || item.id).join(", ") || "-";
    }
    return "-";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 10%, #dbeafe 0%, #fef9c3 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .result-wrap {
          max-width: 1040px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .result-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 12px;
        }
        .result-summary {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          display: grid;
          gap: 10px;
          margin-bottom: 18px;
        }
        .result-grid {
          display: grid;
          gap: 12px;
        }
        .result-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          background: #ffffff;
        }
        .result-pill {
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
        .result-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .result-button {
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
      <main className="result-wrap">
        <h1 className="result-title">Kết quả bài thi</h1>

        {error && <div className="result-error">{error}</div>}

        {result && (
          <>
            <section className="result-summary">
              <div>
                Điểm: <strong>{result.summary.totalEarnedPoints}</strong> / <strong>{result.summary.maxScore}</strong>
              </div>
              <div>
                Accuracy: <strong>{result.summary.accuracyPercentage}%</strong>
              </div>
              <div>
                Đúng/Sai/Bỏ trống: {result.summary.correctCount} / {result.summary.wrongCount} / {result.summary.blankCount}
              </div>
              <div>
                Kết quả: <span className="result-pill">{result.summary.isPassed ? "Passed" : "Not passed"}</span>
              </div>
            </section>

            <section className="result-grid">
              {result.detailedAnswers.map((item, index) => (
                <article key={item.questionId} className="result-card">
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    {index + 1}. {item.questionText}
                  </div>
                  <div>Trạng thái: {item.status}</div>
                  <div>
                    Điểm: {item.points} / {item.maxPoints}
                  </div>
                  <div>Đáp án chọn: {formatAnswer(item.selectedAnswer)}</div>
                  <div>Đáp án đúng: {formatAnswer(item.correctAnswer)}</div>
                </article>
              ))}
            </section>
          </>
        )}

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="result-button" onClick={() => navigate("/dashboard")}>
              Back to homepage
            </button>
            <button
              className="result-button"
              style={{ background: "#ef4444" }}
              onClick={handleDeleteAttempt}
            >
              Delete attempt
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
