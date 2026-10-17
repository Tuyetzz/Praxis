import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  History,
  Pencil,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { TypingText, TypingTextDifficulty } from "../../types/typingText";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "../../components/ui/Field";
import { EmptyState, LoadingState } from "../../components/ui/States";
import {
  createTypingText,
  deleteTypingText,
  getMyTypingTexts,
  getPublicTypingTexts,
  updateTypingText,
} from "../../api/typingTexts";

type TypingTextForm = {
  title: string;
  content: string;
  difficulty: TypingTextDifficulty;
  language: string;
  isPublic: boolean;
};

const EMPTY_FORM: TypingTextForm = {
  title: "",
  content: "",
  difficulty: "medium",
  language: "english",
  isPublic: false,
};

const DIFFICULTY_TONE = {
  easy: "success",
  medium: "warning",
  hard: "danger",
} as const;

export default function ParagraphSelectPage() {
  const navigate = useNavigate();
  const [myTexts, setMyTexts] = useState<TypingText[]>([]);
  const [publicTexts, setPublicTexts] = useState<TypingText[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TypingTextForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadTexts() {
    setLoading(true);
    try {
      const [mine, publics] = await Promise.all([getMyTypingTexts(), getPublicTypingTexts()]);
      setMyTexts(mine);
      setPublicTexts(publics);
    } catch {
      setMyTexts([]);
      setPublicTexts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTexts();
  }, []);

  const handleSelect = (snippet: TypingText) => {
    localStorage.setItem("selectedTypingText", JSON.stringify(snippet));
    navigate("/practice/typing");
  };

  const handleEdit = (text: TypingText) => {
    setEditingId(text.id);
    setForm({
      title: text.title,
      content: text.content,
      difficulty: text.difficulty,
      language: text.language,
      isPublic: text.isPublic,
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (text: TypingText) => {
    if (!window.confirm(`Delete "${text.title}"?`)) return;
    setFormError(null);
    setDeletingId(text.id);
    try {
      await deleteTypingText(text.id);
      await loadTexts();
    } catch {
      setFormError("Unable to delete that passage.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    setFormError(null);
    try {
      if (editingId) {
        await updateTypingText(editingId, form);
      } else {
        await createTypingText(form);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadTexts();
    } catch {
      setFormError("Unable to save the passage. Please try again.");
    }
  };

  const defaultTexts = publicTexts.filter((text) => text.isDefault);
  const sharedPublicTexts = publicTexts.filter((text) => !text.isDefault);

  return (
    <PageShell
      width="lg"
      title="Typing passages"
      subtitle="Pick a passage to practice, or manage your own library."
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            icon={<History size={15} />}
            onClick={() => navigate("/practice/typing/history")}
          >
            History
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles size={15} />}
            onClick={() => navigate("/practice/typing/ai")}
          >
            Summarize with AI
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCcw size={15} />} onClick={loadTexts}>
            Refresh
          </Button>
        </>
      }
    >
      <Card className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Plus size={17} className="text-primary" />
          {editingId ? "Edit passage" : "Create a passage"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            {({ id }) => (
              <Input
                id={id}
                placeholder="e.g. Morning routine"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            )}
          </Field>

          <Field label="Language">
            {({ id }) => (
              <Input
                id={id}
                placeholder="english"
                value={form.language}
                onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
              />
            )}
          </Field>

          <Field label="Difficulty">
            {({ id }) => (
              <Select
                id={id}
                value={form.difficulty}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    difficulty: e.target.value as TypingTextDifficulty,
                  }))
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            )}
          </Field>

          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
              <Checkbox
                checked={form.isPublic}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
              />
              Make this passage public
            </label>
          </div>
        </div>

        <div className="mt-4">
          <Field label="Content">
            {({ id }) => (
              <Textarea
                id={id}
                className="min-h-[140px]"
                placeholder="Paste or write the passage text here..."
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            )}
          </Field>
        </div>

        {formError && (
          <Alert tone="danger" className="mt-3">
            {formError}
          </Alert>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleSubmit}>{editingId ? "Save changes" : "Create passage"}</Button>
          {editingId && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading passages..." />
      ) : (
        <div className="grid gap-10">
          <PassageSection
            title="My passages"
            texts={myTexts}
            emptyLabel="You haven't created any passages yet."
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            editable
          />

          <PassageSection
            title="Default passages"
            texts={defaultTexts}
            emptyLabel="No default passages available yet."
            onSelect={handleSelect}
          />

          <PassageSection
            title="Public passages"
            texts={sharedPublicTexts}
            emptyLabel="No public passages available yet."
            onSelect={handleSelect}
          />
        </div>
      )}
    </PageShell>
  );
}

type SectionProps = {
  title: string;
  texts: TypingText[];
  emptyLabel: string;
  onSelect: (text: TypingText) => void;
  onEdit?: (text: TypingText) => void;
  onDelete?: (text: TypingText) => void;
  deletingId?: string | null;
  editable?: boolean;
};

function PassageSection({
  title,
  texts,
  emptyLabel,
  onSelect,
  onEdit,
  onDelete,
  deletingId,
  editable = false,
}: SectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>

      {texts.length === 0 ? (
        <EmptyState icon={<BookOpen size={24} />} title={emptyLabel} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {texts.map((snippet) => (
            <Card key={snippet.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate font-semibold text-foreground" title={snippet.title}>
                  {snippet.title}
                </h3>
                <Badge tone={DIFFICULTY_TONE[snippet.difficulty] ?? "neutral"}>
                  {snippet.difficulty}
                </Badge>
              </div>

              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{snippet.content}</p>

              <div className="mt-4 flex justify-between border-t border-border pt-3 text-xs text-muted">
                <span>{snippet.content.split(" ").length} words</span>
                <span>{snippet.content.length} characters</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelect(snippet)}
                  icon={<ChevronRight size={14} />}
                >
                  Start
                </Button>

                {editable && onEdit && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(snippet)}
                    aria-label={`Edit ${snippet.title}`}
                  >
                    <Pencil size={14} />
                  </Button>
                )}

                {editable && onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={deletingId === snippet.id}
                    onClick={() => onDelete(snippet)}
                    aria-label={`Delete ${snippet.title}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
