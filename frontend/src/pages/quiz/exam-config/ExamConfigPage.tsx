import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Shuffle, TriangleAlert } from "lucide-react";
import { startAttempt } from "../../../api/attempts";
import { getChapterById, getChapterQuestionCount } from "../../../api/chapters";
import { getSubjectById } from "../../../api/subjects";
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Checkbox, Field, Input, Select } from "../../../components/ui/Field";

export default function ExamConfigPage() {
  const { id: subjectIdParam, chapterId: chapterIdParam } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"exam" | "practice">("practice");

  const [pageSize, setPageSize] = useState(50);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState(30);
  const [showAnswerAfterSelect, setShowAnswerAfterSelect] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(2);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);

  // Exam mode hides the answer; practice mode disables shuffling.
  useEffect(() => {
    if (mode === "exam") setShowAnswerAfterSelect(false);
    if (mode === "practice") setShuffleQuestions(false);
  }, [mode]);

  const chunks = useMemo(() => {
    if (!totalQuestions || !pageSize) return [] as Array<{ start: number; end: number }>;
    const parts: Array<{ start: number; end: number }> = [];
    let start = 1;
    while (start <= totalQuestions) {
      const end = Math.min(start + pageSize - 1, totalQuestions);
      parts.push({ start, end });
      start = end + 1;
    }
    return parts;
  }, [pageSize, totalQuestions]);

  const selectedChunk = chunks[selectedChunkIndex];

  useEffect(() => {
    if (!subjectIdParam) return;
    getSubjectById(subjectIdParam)
      .then((subject) => setSubjectName(subject.name))
      .catch(() => setSubjectName(""));
  }, [subjectIdParam]);

  useEffect(() => {
    if (!chapterIdParam) return;
    getChapterById(chapterIdParam)
      .then((chapter) => setChapterName(chapter.name))
      .catch(() => setChapterName(""));
  }, [chapterIdParam]);

  useEffect(() => {
    if (!chapterIdParam) return;
    setLoadingCount(true);
    setCountError(null);
    getChapterQuestionCount(chapterIdParam)
      .then((res) => setTotalQuestions(res.totalQuestions))
      .catch(() => setCountError("Could not load the question count."))
      .finally(() => setLoadingCount(false));
  }, [chapterIdParam]);

  useEffect(() => {
    if (chunks.length > 0) setSelectedChunkIndex(0);
  }, [chunks.length]);

  async function handleStart() {
    if (!subjectIdParam || !chapterIdParam) {
      setError("Missing or invalid subject/chapter in the URL.");
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

      if (selectedChunk) settings.paging = `${selectedChunk.start}-${selectedChunk.end}`;
      if (questionsPerPage > 0) settings.questionsPerPage = questionsPerPage;
      if (questionTimeSeconds > 0) settings.questionTimeSeconds = questionTimeSeconds;
      settings.showAnswerAfterSelect = mode === "practice" ? showAnswerAfterSelect : false;
      settings.shuffleQuestions = mode === "exam" ? shuffleQuestions : false;

      const res = await startAttempt({
        subjectId: subjectIdParam,
        chapterId: chapterIdParam,
        mode,
        settings,
        durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      });
      navigate(`/attempts/${res.attempt.id}`);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message ===
          "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Could not start the attempt.";
      setError(message || "Could not start the attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  const isExam = mode === "exam";

  return (
    <PageShell
      width="md"
      title="Configure attempt"
      subtitle={
        [subjectName || "Loading subject...", chapterName || "Loading chapter..."]
          .filter(Boolean)
          .join(" · ")
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      }
    >
      <Card className="grid gap-5">
        <Field
          label="Mode"
          hint={isExam ? "Answers are hidden until you submit." : "Instant feedback while you practice."}
        >
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              value={mode}
              onChange={(e) => setMode(e.target.value as "exam" | "practice")}
            >
              <option value="exam">Exam</option>
              <option value="practice">Practice</option>
            </Select>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Questions per set" hint="Splits the chapter into pickable sets.">
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[2, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Questions per page">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                type="number"
                min={1}
                value={questionsPerPage}
                onChange={(e) => setQuestionsPerPage(Number(e.target.value || 0))}
              />
            )}
          </Field>

          <Field label="Seconds per question">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                type="number"
                min={1}
                value={questionTimeSeconds}
                onChange={(e) => setQuestionTimeSeconds(Number(e.target.value || 0))}
              />
            )}
          </Field>

          <Field label="Duration (minutes)">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value || 0))}
              />
            )}
          </Field>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Question set</span>
            <Badge tone="neutral">
              {loadingCount ? "Loading..." : `${totalQuestions ?? 0} questions`}
            </Badge>
          </div>

          {countError && <Alert tone="warning">{countError}</Alert>}

          {chunks.length === 0 ? (
            <p className="text-sm text-muted">No questions available in this chapter.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chunks.map((chunk, index) => {
                const isActive = index === selectedChunkIndex;
                return (
                  <button
                    key={`${chunk.start}-${chunk.end}`}
                    type="button"
                    onClick={() => setSelectedChunkIndex(index)}
                    aria-pressed={isActive}
                    className={[
                      "rounded-control border px-3 py-1.5 text-sm font-semibold transition-all duration-150 ease-smooth",
                      isActive
                        ? "border-primary bg-primary text-primary-fg shadow-sm"
                        : "border-border bg-surface-raised text-foreground hover:border-primary/40 hover:bg-surface-sunken",
                    ].join(" ")}
                  >
                    {chunk.start}–{chunk.end}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-3 border-t border-border pt-4">
          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <Checkbox
              checked={shuffleQuestions}
              disabled={mode !== "exam"}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
            />
            <Shuffle size={15} className="text-muted" />
            Shuffle questions
            {mode !== "exam" && <span className="text-xs text-muted">(exam mode only)</span>}
          </label>

          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <Checkbox
              checked={showAnswerAfterSelect}
              disabled={mode !== "practice"}
              onChange={(e) => setShowAnswerAfterSelect(e.target.checked)}
            />
            <TriangleAlert size={15} className="text-muted" />
            Show the answer right after selecting
            {mode !== "practice" && <span className="text-xs text-muted">(practice mode only)</span>}
          </label>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        <div className="flex justify-end border-t border-border pt-4">
          <Button
            size="lg"
            icon={<Play size={16} />}
            loading={submitting}
            disabled={!selectedChunk}
            onClick={handleStart}
          >
            {submitting ? "Starting..." : "Start attempt"}
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
