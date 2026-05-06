import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttempt,
  saveAttemptAnswer,
  submitAttempt,
  type SaveAnswerPayload,
} from "../../../api/attempts";
import { getAttemptQuestions } from "../../../api/attemptsQuestion";
import type { Attempt } from "../../../types/attempt";
import type { Option } from "../../../types/options";
import type { Question } from "../../../types/question";
import AppHeader from "../../../components/AppHeader";

type QuestionWithOptions = Question & { options: Option[] };

type LocalAnswer = {
  selectedOptionIds: string[];
  value: string;
  flagged: boolean;
};

function parsePagingRange(input: unknown, maxLength: number): { from: number; to: number } {
  if (typeof input === "string") {
    const match = input.match(/^(\d+)\s*-\s*(\d+)$/);
    if (match) {
      const from = Math.max(1, Number(match[1]));
      const to = Math.max(from, Number(match[2]));
      return { from, to: Math.min(to, maxLength) };
    }
  }

  if (typeof input === "object" && input) {
    const from = Number((input as { from?: number }).from ?? 1);
    const to = Number((input as { to?: number }).to ?? maxLength);
    const normalizedFrom = Number.isFinite(from) ? Math.max(1, Math.floor(from)) : 1;
    const normalizedTo = Number.isFinite(to) ? Math.max(normalizedFrom, Math.floor(to)) : maxLength;
    return { from: normalizedFrom, to: Math.min(normalizedTo, maxLength) };
  }

  return { from: 1, to: maxLength };
}


export default function AttemptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attemptId = id || "";

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, LocalAnswer>>({});
  const [correctAnswersByQuestionId, setCorrectAnswersByQuestionId] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const settings = attempt?.settings;
  const questionsPerPage = Math.max(1, Number(settings?.questionsPerPage || 10));
  const totalPages = Math.max(1, Math.ceil(questions.length / questionsPerPage));
  const pagingRange = useMemo(
    () => parsePagingRange(settings?.paging, questions.length),
    [settings?.paging, questions.length]
  );
  const questionNumberOffset = pagingRange.from - 1;

  const orderedQuestions = useMemo(() => questions, [questions]);
  const pagedQuestions = useMemo(() => {
    const start = currentPage * questionsPerPage;
    return orderedQuestions.slice(start, start + questionsPerPage);
  }, [currentPage, orderedQuestions, questionsPerPage]);

  const readOnly = attempt?.status !== "in_progress";
  const showCorrectAnswers = Boolean(attempt?.settings?.showAnswerAfterSelect);

  useEffect(() => {
    let alive = true;

    async function loadAttemptData() {
      if (!attemptId) {
        setError("Thiếu attempt id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const attemptData = await getAttempt(attemptId);
        if (!alive) return;

        setAttempt(attemptData);

        if (!attemptData.chapterId) {
          setQuestions([]);
          return;
        }

        const attemptQuestions = await getAttemptQuestions(attemptId);
        const selectedQuestions = attemptQuestions
          .map((aq) => aq.question)
          .filter(Boolean) as Question[];

        const withOptions = selectedQuestions.map((q) => ({
          ...q,
          options: q.options ?? [],
        }));

        if (!alive) return;
        setQuestions(withOptions);
        setCurrentPage(0);
      } catch (e: unknown) {
        const message =
          typeof e === "object" &&
          e &&
          "response" in e &&
          typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : "Không tải được attempt.";
        if (alive) setError(message || "Không tải được attempt.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAttemptData();
    return () => {
      alive = false;
    };
  }, [attemptId]);

  async function persistAnswer(questionId: string, next: LocalAnswer) {
    if (readOnly) return;

    const payload: SaveAnswerPayload = {
      questionId,
      flagged: next.flagged,
    };

    if (next.selectedOptionIds.length > 0) {
      payload.selectedOptionIds = next.selectedOptionIds;
    }

    if (next.value.trim()) {
      payload.value = next.value;
    }

    try {
      const res = await saveAttemptAnswer(attemptId, payload);
      setAnswersByQuestionId((prev) => ({
        ...prev,
        [questionId]: next,
      }));
      if (showCorrectAnswers && res.correctAnswers) {
        setCorrectAnswersByQuestionId((prev) => ({
          ...prev,
          [questionId]: res.correctAnswers.map((answer) => answer.text),
        }));
      }
      setError(null);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Không lưu được đáp án.";
      setError(message || "Không lưu được đáp án.");
    }
  }

  async function onPickSingle(questionId: string, optionId: string) {
    const prev = answersByQuestionId[questionId] || { selectedOptionIds: [], value: "", flagged: false };
    const next: LocalAnswer = {
      ...prev,
      selectedOptionIds: [optionId],
      value: "",
    };
    await persistAnswer(questionId, next);
  }

  async function onToggleMultiple(questionId: string, optionId: string) {
    const prev = answersByQuestionId[questionId] || { selectedOptionIds: [], value: "", flagged: false };
    const set = new Set(prev.selectedOptionIds);
    if (set.has(optionId)) set.delete(optionId);
    else set.add(optionId);

    const next: LocalAnswer = {
      ...prev,
      selectedOptionIds: [...set],
      value: "",
    };

    await persistAnswer(questionId, next);
  }

  async function onChangeFillBlank(questionId: string, value: string) {
    const prev = answersByQuestionId[questionId] || { selectedOptionIds: [], value: "", flagged: false };
    const next: LocalAnswer = {
      ...prev,
      selectedOptionIds: [],
      value,
    };

    setAnswersByQuestionId((old) => ({ ...old, [questionId]: next }));
  }

  async function onBlurFillBlank(questionId: string) {
    const current = answersByQuestionId[questionId];
    if (!current) return;
    await persistAnswer(questionId, current);
  }

  async function onToggleFlag(questionId: string) {
    const prev = answersByQuestionId[questionId] || { selectedOptionIds: [], value: "", flagged: false };
    const next = { ...prev, flagged: !prev.flagged };
    await persistAnswer(questionId, next);
  }

  async function onSubmitAttempt() {
    if (!attemptId || submitting) return;

    if (readOnly) {
      navigate(`/attempts/${attemptId}/result`, { replace: true });
      return;
    }

    try {
      setSubmitting(true);
      await submitAttempt(attemptId);
      navigate(`/attempts/${attemptId}/result`, { replace: true });
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Có lỗi khi nộp bài.";
      setError(message || "Có lỗi khi nộp bài.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Đang tải bài thi...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 10%, #fdf4ff 0%, #e0f2fe 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .attempt-wrap {
          max-width: 980px;
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
        .attempt-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          margin-bottom: 14px;
        }
        .attempt-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .attempt-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 12px;
        }
        .attempt-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          font-size: 12px;
        }
        .attempt-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
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
        .attempt-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .attempt-correct {
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: #ecfdf3;
          color: #15803d;
          font-size: 13px;
        }
      `}</style>
      <main className="attempt-wrap">
        <h1 className="attempt-title">Làm bài thi</h1>
        <div className="attempt-subtitle">
          <span className="attempt-pill">Trạng thái: {attempt?.status}</span>
        </div>

      {error && (
        <div className="attempt-error">{error}</div>
      )}

      {pagedQuestions.map((q, idx) => {
        const local = answersByQuestionId[q.id] || { selectedOptionIds: [], value: "", flagged: false };
        const correctTexts = correctAnswersByQuestionId[q.id] || [];

        return (
          <div key={q.id} className="attempt-card">
            <div className="attempt-question">
              <p style={{ margin: 0, fontWeight: 600 }}>
                {questionNumberOffset + currentPage * questionsPerPage + idx + 1}. {q.text}
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={local.flagged}
                  disabled={readOnly}
                  onChange={() => void onToggleFlag(q.id)}
                />
                Flag
              </label>
            </div>

            {(q.type === "single" || q.type === "true_false") && (
              <div style={{ marginTop: 12 }}>
                {q.options.map((opt) => (
                  <label key={opt.id} style={{ display: "block", marginBottom: 8 }}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      disabled={readOnly}
                      checked={local.selectedOptionIds[0] === opt.id}
                      onChange={() => void onPickSingle(q.id, opt.id)}
                    />
                    <span style={{ marginLeft: 8 }}>{opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "multiple" && (
              <div style={{ marginTop: 12 }}>
                {q.options.map((opt) => (
                  <label key={opt.id} style={{ display: "block", marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={local.selectedOptionIds.includes(opt.id)}
                      onChange={() => void onToggleMultiple(q.id, opt.id)}
                    />
                    <span style={{ marginLeft: 8 }}>{opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "fill_blank" && (
              <input
                style={{ marginTop: 12, width: "100%", maxWidth: 420, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                value={local.value}
                disabled={readOnly}
                onChange={(e) => void onChangeFillBlank(q.id, e.target.value)}
                onBlur={() => void onBlurFillBlank(q.id)}
                placeholder="Nhập đáp án"
              />
            )}

            {showCorrectAnswers && correctTexts.length > 0 && (
              <div className="attempt-correct">
                Đáp án đúng: {correctTexts.join(", ")}
              </div>
            )}
          </div>
        );
      })}

      <div className="attempt-footer">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="attempt-button"
            disabled={currentPage <= 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          >
            Trang trước
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className="attempt-button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Trang sau
          </button>
        </div>
        <button className="attempt-button" disabled={submitting} onClick={() => void onSubmitAttempt()}>
          {readOnly ? "Xem kết quả" : submitting ? "Đang nộp..." : "Nộp bài"}
        </button>
      </div>
      </main>
    </div>
  );
}
