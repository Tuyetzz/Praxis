import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startAttempt } from "../../../api/attempts";

export default function ExamConfigPage() {
  const { id: subjectIdParam, chapterId: chapterIdParam } = useParams();
  const navigate = useNavigate();

  // mode
  const [mode, setMode] = useState<"exam" | "practice">("practice");

  // common
  const [paging, setPaging] = useState("1-50");
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState(30);
  const [showAnswerAfterSelect, setShowAnswerAfterSelect] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(2);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!subjectIdParam || !chapterIdParam) {
      setError("Thiếu hoặc sai subjectId/chapterId trên URL.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const settings: {
        paging?: string;
        questionsPerPage?: number;
        questionTimeSeconds?: number;
        showAnswerAfterSelect?: boolean;
        shuffleQuestions?: boolean;
      } = {};

      if (paging.trim()) settings.paging = paging.trim();
      if (questionsPerPage > 0) settings.questionsPerPage = questionsPerPage;
      if (questionTimeSeconds > 0) settings.questionTimeSeconds = questionTimeSeconds;
      settings.showAnswerAfterSelect = showAnswerAfterSelect;
      settings.shuffleQuestions = shuffleQuestions;

      const payload = {
        subjectId: subjectIdParam,
        chapterId: chapterIdParam,
        mode,
        settings,
        durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      };

      const res = await startAttempt(payload);
      navigate(`/attempts/${res.attempt.id}`);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Không tạo được attempt.";
      setError(message || "Không tạo được attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 560 }}>
      <h1>Cấu hình Attempt</h1>
      <div style={{ color: "#6b7280", marginBottom: 16 }}>
        Subject: {subjectIdParam} · Chapter: {chapterIdParam}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Chế độ:
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "exam" | "practice")}
            style={{ marginLeft: 8 }}
          >
            <option value="exam">Thi (Exam)</option>
            <option value="practice">Luyện tập (Practice)</option>
          </select>
        </label>

        <label>
          Paging (X-Y):
          <input
            value={paging}
            onChange={(e) => setPaging(e.target.value)}
            placeholder="1-50"
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          Questions / page:
          <input
            type="number"
            value={questionsPerPage}
            onChange={(e) => setQuestionsPerPage(Number(e.target.value || 0))}
            min={1}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          Question time (seconds):
          <input
            type="number"
            value={questionTimeSeconds}
            onChange={(e) => setQuestionTimeSeconds(Number(e.target.value || 0))}
            min={1}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          Duration (minutes):
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value || 0))}
            min={1}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
          />
          Shuffle câu hỏi
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={showAnswerAfterSelect}
            onChange={(e) => setShowAnswerAfterSelect(e.target.checked)}
          />
          Hiển thị đáp án ngay sau khi chọn
        </label>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              color: "#991B1B",
              padding: 10,
              borderRadius: 6,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={submitting}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: submitting ? "#ddd" : "#e5ffe5",
            cursor: submitting ? "not-allowed" : "pointer",
            marginTop: 8,
            width: 160,
          }}
        >
          {submitting ? "Đang tạo..." : "Bắt đầu"}
        </button>
      </div>
    </div>
  );
}
