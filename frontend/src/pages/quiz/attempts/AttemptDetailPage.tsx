import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
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
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/States";
import { Checkbox, Input, Radio } from "../../../components/ui/Field";

type QuestionWithOptions = Question & { options: Option[] };

type LocalAnswer = {
  selectedOptionIds: string[];
  value: string;
  flagged: boolean;
};

const EMPTY_ANSWER: LocalAnswer = { selectedOptionIds: [], value: "", flagged: false };

const STATUS_TONE = {
  in_progress: "primary",
  graded: "success",
  submitted: "success",
  expired: "warning",
  draft: "neutral",
} as const;

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

function extractErrorMessage(e: unknown, fallback: string): string {
  if (
    typeof e === "object" &&
    e &&
    "response" in e &&
    typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (e as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
  }
  return fallback;
}

export default function AttemptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attemptId = id || "";

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, LocalAnswer>>({});
  const [correctAnswersByQuestionId, setCorrectAnswersByQuestionId] = useState<
    Record<string, string[]>
  >({});
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

  const pagedQuestions = useMemo(() => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  }, [currentPage, questions, questionsPerPage]);

  const readOnly = attempt?.status !== "in_progress";
  const showCorrectAnswers = Boolean(attempt?.settings?.showAnswerAfterSelect);

  useEffect(() => {
    let alive = true;

    async function loadAttemptData() {
      if (!attemptId) {
        setError("Missing attempt id.");
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

        if (!alive) return;
        setQuestions(selectedQuestions.map((q) => ({ ...q, options: q.options ?? [] })));
        setCurrentPage(0);
      } catch (e: unknown) {
        if (alive) setError(extractErrorMessage(e, "Could not load this attempt."));
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

    const payload: SaveAnswerPayload = { questionId, flagged: next.flagged };
    if (next.selectedOptionIds.length > 0) payload.selectedOptionIds = next.selectedOptionIds;
    if (next.value.trim()) payload.value = next.value;

    try {
      const res = await saveAttemptAnswer(attemptId, payload);
      setAnswersByQuestionId((prev) => ({ ...prev, [questionId]: next }));
      const correct = res.correctAnswers;
      if (showCorrectAnswers && correct) {
        setCorrectAnswersByQuestionId((prev) => ({
          ...prev,
          [questionId]: correct.map((answer) => answer.text),
        }));
      }
      setError(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not save your answer."));
    }
  }

  async function onPickSingle(questionId: string, optionId: string) {
    const prev = answersByQuestionId[questionId] || EMPTY_ANSWER;
    await persistAnswer(questionId, { ...prev, selectedOptionIds: [optionId], value: "" });
  }

  async function onToggleMultiple(questionId: string, optionId: string) {
    const prev = answersByQuestionId[questionId] || EMPTY_ANSWER;
    const set = new Set(prev.selectedOptionIds);
    if (set.has(optionId)) set.delete(optionId);
    else set.add(optionId);
    await persistAnswer(questionId, { ...prev, selectedOptionIds: [...set], value: "" });
  }

  function onChangeFillBlank(questionId: string, value: string) {
    const prev = answersByQuestionId[questionId] || EMPTY_ANSWER;
    // Kept local on change; persisted on blur so we don't fire a request per keystroke.
    setAnswersByQuestionId((old) => ({ ...old, [questionId]: { ...prev, selectedOptionIds: [], value } }));
  }

  async function onBlurFillBlank(questionId: string) {
    const current = answersByQuestionId[questionId];
    if (!current) return;
    await persistAnswer(questionId, current);
  }

  async function onToggleFlag(questionId: string) {
    const prev = answersByQuestionId[questionId] || EMPTY_ANSWER;
    await persistAnswer(questionId, { ...prev, flagged: !prev.flagged });
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
      setError(extractErrorMessage(e, "Something went wrong while submitting."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell width="md">
        <LoadingState label="Loading attempt..." />
      </PageShell>
    );
  }

  const answeredCount = Object.values(answersByQuestionId).filter(
    (a) => a.selectedOptionIds.length > 0 || a.value.trim()
  ).length;

  return (
    <PageShell
      width="md"
      title={readOnly ? "Review attempt" : "Attempt in progress"}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[attempt?.status ?? "draft"] ?? "neutral"}>
            {attempt?.status ?? "unknown"}
          </Badge>
          <span>
            {answeredCount} of {questions.length} answered
          </span>
        </span>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid gap-3.5">
        {pagedQuestions.map((q, idx) => {
          const local = answersByQuestionId[q.id] || EMPTY_ANSWER;
          const correctTexts = correctAnswersByQuestionId[q.id] || [];
          const number = questionNumberOffset + currentPage * questionsPerPage + idx + 1;

          return (
            <Card key={q.id}>
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-foreground">
                  <span className="mr-2 text-muted">{number}.</span>
                  {q.text}
                </p>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-muted">
                  <Checkbox
                    checked={local.flagged}
                    disabled={readOnly}
                    onChange={() => void onToggleFlag(q.id)}
                  />
                  <Flag size={13} className={local.flagged ? "text-warning" : ""} />
                  Flag
                </label>
              </div>

              {(q.type === "single" || q.type === "true_false") && (
                <div className="mt-3.5 grid gap-1">
                  {q.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors ${
                        local.selectedOptionIds[0] === opt.id
                          ? "bg-primary-soft text-primary"
                          : "hover:bg-surface-sunken"
                      } ${readOnly ? "cursor-default" : ""}`}
                    >
                      <Radio
                        name={`question-${q.id}`}
                        disabled={readOnly}
                        checked={local.selectedOptionIds[0] === opt.id}
                        onChange={() => void onPickSingle(q.id, opt.id)}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "multiple" && (
                <div className="mt-3.5 grid gap-1">
                  {q.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors ${
                        local.selectedOptionIds.includes(opt.id)
                          ? "bg-primary-soft text-primary"
                          : "hover:bg-surface-sunken"
                      } ${readOnly ? "cursor-default" : ""}`}
                    >
                      <Checkbox
                        disabled={readOnly}
                        checked={local.selectedOptionIds.includes(opt.id)}
                        onChange={() => void onToggleMultiple(q.id, opt.id)}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "fill_blank" && (
                <Input
                  className="mt-3.5 max-w-md"
                  value={local.value}
                  disabled={readOnly}
                  onChange={(e) => onChangeFillBlank(q.id, e.target.value)}
                  onBlur={() => void onBlurFillBlank(q.id)}
                  placeholder="Type your answer"
                />
              )}

              {showCorrectAnswers && correctTexts.length > 0 && (
                <Alert tone="success" className="mt-3">
                  Correct answer: {correctTexts.join(", ")}
                </Alert>
              )}
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface-raised/95 px-4 py-3 shadow-lift backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={15} />}
            disabled={currentPage <= 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="px-1 text-sm text-muted">
            Page {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
            <ChevronRight size={15} />
          </Button>
        </div>

        <Button
          loading={submitting}
          icon={readOnly ? undefined : <Send size={15} />}
          onClick={() => void onSubmitAttempt()}
        >
          {readOnly ? "View result" : submitting ? "Submitting..." : "Submit attempt"}
        </Button>
      </div>
    </PageShell>
  );
}
