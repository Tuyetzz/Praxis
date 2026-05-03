import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttemptGrade, type AttemptGradeResponse } from "../../../api/attempts";

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

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 12 }}>Kết quả bài thi</h1>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 10, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {result && (
        <>
          <section
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              background: "#f9fafb",
            }}
          >
            <div>Attempt: {result.attempt.id}</div>
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
              Kết quả: {result.summary.isPassed ? "Passed" : "Not passed"}
            </div>
          </section>

          <section style={{ display: "grid", gap: 12 }}>
            {result.detailedAnswers.map((item, index) => (
              <article
                key={item.questionId}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {index + 1}. {item.questionText}
                </div>
                <div>Trạng thái: {item.status}</div>
                <div>
                  Điểm: {item.points} / {item.maxPoints}
                </div>
                <div>Đáp án chọn: {JSON.stringify(item.selectedAnswer)}</div>
                <div>Đáp án đúng: {JSON.stringify(item.correctAnswer)}</div>
              </article>
            ))}
          </section>
        </>
      )}

      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate("/dashboard")}>Back to homepage</button>
      </div>
    </div>
  );
}
