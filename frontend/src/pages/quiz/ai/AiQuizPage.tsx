import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { generateQuiz } from "../../../api/ai";
import type { GeneratedQuestion } from "../../../api/ai";
import { batchCreateQuestions } from "../../../api/questions";
import { getSubjects } from "../../../api/subjects";
import { getChaptersBySubject } from "../../../api/chapters";
import type { Subject } from "../../../types/subject";
import type { Chapter } from "../../../types/chapter";
import type { QuestionType } from "../../../types/question";
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";

type InputMode = "topic" | "text";

type DraftQuestion = GeneratedQuestion & {
  /** Stable key for React lists; generated locally. */
  key: string;
  selected: boolean;
};

const QUESTION_TYPE_OPTIONS: Array<{ value: QuestionType; label: string }> = [
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "fill_blank", label: "Fill in the blank" },
];

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

function makeKey(index: number) {
  return `draft-${Date.now()}-${index}`;
}

/** Local fallback so the UI is usable before the backend AI endpoint exists. */
function buildMockQuestions(topic: string, count: number): GeneratedQuestion[] {
  const subject = topic.trim() || "the given topic";
  const questions: GeneratedQuestion[] = [];

  for (let i = 1; i <= count; i += 1) {
    questions.push({
      text: `Sample question ${i} about ${subject}?`,
      type: "single",
      explanation: `Placeholder explanation for question ${i}.`,
      difficulty: 2,
      points: 1,
      options: [
        { text: `Correct answer for question ${i}`, isCorrect: true, order: 1 },
        { text: `Distractor A for question ${i}`, isCorrect: false, order: 2 },
        { text: `Distractor B for question ${i}`, isCorrect: false, order: 3 },
        { text: `Distractor C for question ${i}`, isCorrect: false, order: 4 },
      ],
    });
  }

  return questions;
}

export default function AiQuizPage() {
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<InputMode>("topic");
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["single"]);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setChapters([]);
      setChapterId("");
      return;
    }
    setLoadingChapters(true);
    getChaptersBySubject(subjectId)
      .then((data) => {
        setChapters(data);
        setChapterId(data.length > 0 ? data[0].id : "");
      })
      .catch(() => setChapters([]))
      .finally(() => setLoadingChapters(false));
  }, [subjectId]);

  const selectedCount = useMemo(() => drafts.filter((d) => d.selected).length, [drafts]);

  function toggleType(type: QuestionType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleGenerate() {
    const source = inputMode === "topic" ? topic.trim() : sourceText.trim();

    if (!source) {
      setError(
        inputMode === "topic"
          ? "Enter a topic to generate questions about."
          : "Paste some text to generate questions from."
      );
      return;
    }

    if (numQuestions < 1 || numQuestions > 50) {
      setError("Choose between 1 and 50 questions.");
      return;
    }

    if (selectedTypes.length === 0) {
      setError("Select at least one question type.");
      return;
    }

    setError(null);
    setNotice(null);
    setGenerating(true);

    try {
      const res = await generateQuiz({
        topic: source,
        numQuestions,
        subjectId,
        chapterId,
        questionTypes: selectedTypes,
        difficulty,
        language: "english",
      });

      const generated = res?.questions ?? [];
      if (generated.length === 0) {
        throw new Error("empty");
      }

      setDrafts(generated.map((q, i) => ({ ...q, key: makeKey(i), selected: true })));
      setAiUnavailable(false);
      setNotice(`Generated ${generated.length} question${generated.length === 1 ? "" : "s"}.`);
    } catch (e: unknown) {
      // The backend endpoint does not exist yet, so a 404 is expected.
      // Fall back to local placeholders so the review/save flow stays usable.
      const status =
        typeof e === "object" && e && "response" in e
          ? (e as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 404 || status === 501) {
        setDrafts(
          buildMockQuestions(source, numQuestions).map((q, i) => ({
            ...q,
            key: makeKey(i),
            selected: true,
          }))
        );
        setAiUnavailable(true);
        setNotice(null);
      } else {
        const message =
          typeof e === "object" &&
          e &&
          "response" in e &&
          typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message ===
            "string"
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : "Could not generate questions. Please try again.";
        setError(message || "Could not generate questions. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  }

  function updateDraft(key: string, patch: Partial<DraftQuestion>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function removeDraft(key: string) {
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  }

  function toggleAll(selected: boolean) {
    setDrafts((prev) => prev.map((d) => ({ ...d, selected })));
  }

  async function handleSave() {
    if (!subjectId || !chapterId) {
      setError("Choose the subject and chapter to save into.");
      return;
    }

    const chosen = drafts.filter((d) => d.selected);
    if (chosen.length === 0) {
      setError("Select at least one question to save.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await batchCreateQuestions({
        mode: "all-or-nothing",
        subjectId,
        chapterId,
        items: chosen.map((d) => ({
          text: d.text,
          type: d.type,
          explanation: d.explanation ?? null,
          difficulty: d.difficulty ?? 1,
          points: d.points ?? 1,
          tags: ["ai-generated"],
          options: d.options.map((o, index) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: o.order ?? index + 1,
          })),
        })),
      });

      setNotice(`Saved ${res.created} question${res.created === 1 ? "" : "s"} to the chapter.`);
      setDrafts([]);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message ===
          "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Could not save the questions.";
      setError(message || "Could not save the questions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      width="lg"
      title="Generate questions with AI"
      subtitle="Describe a topic or paste source material, then review before saving."
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<FileText size={15} />}
          onClick={() => navigate("/subjects")}
        >
          Browse subjects
        </Button>
      }
    >
      {aiUnavailable && (
        <Alert tone="warning" title="AI backend not connected yet" className="mb-4">
          <code>POST /api/ai/generate-quiz</code> isn&apos;t implemented, so placeholder
          questions are shown. The review and save steps below work for real.
        </Alert>
      )}

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {notice && (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* ---- Input ---- */}
        <Card className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={inputMode === "topic" ? "primary" : "secondary"}
              icon={<Sparkles size={14} />}
              onClick={() => setInputMode("topic")}
            >
              From a topic
            </Button>
            <Button
              size="sm"
              variant={inputMode === "text" ? "primary" : "secondary"}
              icon={<FileText size={14} />}
              onClick={() => setInputMode("text")}
            >
              From pasted text
            </Button>
          </div>

          {inputMode === "topic" ? (
            <Field label="Topic" hint="For example: “The water cycle” or “World War II causes”.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should the questions be about?"
                />
              )}
            </Field>
          ) : (
            <Field
              label="Source text"
              hint="Paste an article, notes or chapter text — questions are drawn from it."
            >
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  className="min-h-[200px]"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste your source material here..."
                />
              )}
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Number of questions" hint="Between 1 and 50.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  type="number"
                  min={1}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value || 1))}
                />
              )}
            </Field>

            <Field label="Difficulty">
              {({ id }) => (
                <Select
                  id={id}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}
                >
                  {[1, 2, 3].map((d) => (
                    <option key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Question types</span>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPE_OPTIONS.map((option) => {
                const active = selectedTypes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleType(option.value)}
                    className={[
                      "rounded-control border px-3 py-1.5 text-sm font-semibold transition-all duration-150 ease-smooth",
                      active
                        ? "border-primary bg-primary text-primary-fg shadow-sm"
                        : "border-border bg-surface-raised text-foreground hover:border-primary/40 hover:bg-surface-sunken",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button icon={<Wand2 size={16} />} loading={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate questions"}
            </Button>
            {drafts.length > 0 && (
              <Button
                variant="secondary"
                size="md"
                icon={<RefreshCw size={15} />}
                loading={generating}
                onClick={handleGenerate}
              >
                Regenerate
              </Button>
            )}
          </div>
        </Card>

        {/* ---- Destination ---- */}
        <Card as="section" className="self-start">
          <h2 className="mb-4 font-semibold text-foreground">Save destination</h2>

          <div className="grid gap-4">
            <Field label="Subject">
              {({ id }) => (
                <Select
                  id={id}
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field
              label="Chapter"
              hint={loadingChapters ? "Loading chapters..." : undefined}
            >
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={chapterId}
                  disabled={!subjectId || loadingChapters}
                  onChange={(e) => setChapterId(e.target.value)}
                >
                  <option value="">
                    {!subjectId ? "Pick a subject first" : "Select a chapter"}
                  </option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Alert tone="info">
              Questions are appended to the chosen chapter. Nothing is saved until you press Save.
            </Alert>
          </div>
        </Card>
      </div>

      {/* ---- Preview ---- */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            Review
            {drafts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted">
                {selectedCount} of {drafts.length} selected
              </span>
            )}
          </h2>

          {drafts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggleAll(true)}>
                Select all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleAll(false)}>
                Select none
              </Button>
              <Button
                size="sm"
                icon={<Save size={15} />}
                loading={saving}
                disabled={selectedCount === 0 || !chapterId}
                onClick={handleSave}
              >
                Save {selectedCount > 0 ? `${selectedCount} ` : ""}to chapter
              </Button>
            </div>
          )}
        </div>

        {drafts.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={26} />}
            title="No questions yet"
            description="Describe a topic or paste text, then press Generate questions."
          />
        ) : (
          <div className="grid gap-3">
            {drafts.map((draft, index) => (
              <Card key={draft.key} className={draft.selected ? "" : "opacity-60"}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    className="mt-1"
                    checked={draft.selected}
                    onChange={(e) => updateDraft(draft.key, { selected: e.target.checked })}
                    aria-label={`Include question ${index + 1}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">#{index + 1}</Badge>
                      <Badge tone="primary">
                        {QUESTION_TYPE_OPTIONS.find((o) => o.value === draft.type)?.label ??
                          draft.type}
                      </Badge>
                      {draft.difficulty && (
                        <Badge tone="warning">
                          {DIFFICULTY_LABELS[draft.difficulty] ?? draft.difficulty}
                        </Badge>
                      )}
                    </div>

                    <Textarea
                      value={draft.text}
                      onChange={(e) => updateDraft(draft.key, { text: e.target.value })}
                      className="min-h-[60px]"
                      aria-label={`Question ${index + 1} text`}
                    />

                    <ul className="mt-3 grid gap-1.5">
                      {draft.options.map((option, optIndex) => (
                        <li
                          key={optIndex}
                          className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-sm ${
                            option.isCorrect
                              ? "bg-success-soft text-success"
                              : "bg-surface-sunken text-muted"
                          }`}
                        >
                          {option.isCorrect ? (
                            <CheckCircle2 size={15} className="shrink-0" />
                          ) : (
                            <AlertCircle size={15} className="shrink-0 opacity-50" />
                          )}
                          <span className="min-w-0 flex-1">{option.text}</span>
                        </li>
                      ))}
                    </ul>

                    {draft.explanation && (
                      <p className="mt-2 text-xs text-muted">
                        <span className="font-medium">Explanation:</span> {draft.explanation}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDraft(draft.key)}
                    aria-label={`Remove question ${index + 1}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
