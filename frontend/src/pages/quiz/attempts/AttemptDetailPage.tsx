import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttempt,
  saveAttemptAnswer,
  submitAttempt,
  type SaveAnswerPayload,
} from "../../../api/attempts";
import { getQuestionsByChapter } from "../../../api/questions";
import { getOptionsByQuestion } from "../../../api/options";
import type { Attempt } from "../../../types/attempt";
import type { Option } from "../../../types/options";
import type { Question } from "../../../types/question";

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

function sortByCreatedAtThenId(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return String(a.id).localeCompare(String(b.id));
  });
}

export default function AttemptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attemptId = id || "";

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, LocalAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const settings = attempt?.settings;
  const questionsPerPage = Math.max(1, Number(settings?.questionsPerPage || 10));
  const totalPages = Math.max(1, Math.ceil(questions.length / questionsPerPage));
  const [currentPage, setCurrentPage] = useState(0);

  const pagedQuestions = useMemo(() => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  }, [questions, currentPage, questionsPerPage]);

  const readOnly = attempt?.status !== "in_progress";

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

        const chapterQuestions = await getQuestionsByChapter(String(attemptData.chapterId));
        if (!alive) return;

        const ordered = sortByCreatedAtThenId(chapterQuestions);
        const { from, to } = parsePagingRange(attemptData.settings?.paging, ordered.length);
        const selectedQuestions = ordered.slice(from - 1, to);

        const withOptions = await Promise.all(
          selectedQuestions.map(async (q) => {
            const options = await getOptionsByQuestion(String(q.id));
            return { ...q, options };
          })
        );

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

    await saveAttemptAnswer(attemptId, payload);

    setAnswersByQuestionId((prev) => ({
      ...prev,
      [questionId]: next,
    }));
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
    if (!attemptId || readOnly || submitting) return;

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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Làm bài thi</h1>
      <div style={{ color: "#4b5563", marginBottom: 16 }}>
        Attempt: {attemptId} | Status: {attempt?.status}
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 10, borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {pagedQuestions.map((q, idx) => {
        const local = answersByQuestionId[q.id] || { selectedOptionIds: [], value: "", flagged: false };

        return (
          <div key={q.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {currentPage * questionsPerPage + idx + 1}. {q.text}
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
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <button disabled={currentPage <= 0} onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>
          Trang trước
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          Trang sau
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <button disabled={readOnly || submitting} onClick={() => void onSubmitAttempt()}>
          {submitting ? "Đang nộp..." : "Nộp bài"}
        </button>
      </div>

    </div>
  );
}
