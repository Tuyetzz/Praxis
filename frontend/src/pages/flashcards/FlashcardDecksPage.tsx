import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Layers, Lock, Pencil, Plus, Trash2, Globe } from "lucide-react";
import {
  createFlashcardDeck,
  deleteFlashcardDeck,
  getMyFlashcardDecks,
  getPublicFlashcardDecks,
  updateFlashcardDeck,
} from "../../api/flashcardDecks";
import type { FlashcardDeck } from "../../types/flashcardDeck";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Checkbox, Field, Input } from "../../components/ui/Field";
import { EmptyState, LoadingState } from "../../components/ui/States";

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

export default function FlashcardDecksPage() {
  const navigate = useNavigate();
  const [mine, setMine] = useState<FlashcardDeck[]>([]);
  const [publicDecks, setPublicDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPublic, setEditingPublic] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [myDecks, pubDecks] = await Promise.all([
        getMyFlashcardDecks(),
        getPublicFlashcardDecks(),
      ]);
      setMine(myDecks);
      setPublicDecks(pubDecks);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not load your flashcard decks."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Public decks the user doesn't own (their own are listed under "My decks").
  const publicOnly = useMemo(() => {
    const myIds = new Set(mine.map((d) => d.id));
    return publicDecks.filter((d) => !myIds.has(d.id));
  }, [mine, publicDecks]);

  async function handleCreateDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      await createFlashcardDeck({ title: title.trim(), isPublic });
      setTitle("");
      setIsPublic(false);
      await loadData();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not create the deck."));
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(deck: FlashcardDeck) {
    setEditingId(deck.id);
    setEditingTitle(deck.title);
    setEditingPublic(deck.isPublic);
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await updateFlashcardDeck(editingId, {
        title: editingTitle.trim(),
        isPublic: editingPublic,
      });
      setEditingId(null);
      await loadData();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not update the deck."));
    }
  }

  async function handleDeleteDeck(id: string) {
    if (!window.confirm("Delete this deck? Cards inside it will be removed too.")) return;
    try {
      await deleteFlashcardDeck(id);
      await loadData();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not delete the deck."));
    }
  }

  return (
    <PageShell
      width="wide"
      title="Flashcards"
      subtitle="Create your own decks or study the ones shared by others."
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card as="section">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Plus size={17} className="text-primary" />
            Create a deck
          </h2>
          <form onSubmit={handleCreateDeck} className="grid gap-4">
            <Field label="Deck title">
              {({ id }) => (
                <Input
                  id={id}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Biology chapter 3"
                />
              )}
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
              <Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Make this deck public
            </label>

            <Button type="submit" loading={submitting} className="justify-self-start">
              {submitting ? "Creating..." : "Create deck"}
            </Button>
          </form>
        </Card>

        <Card as="section">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Globe size={17} className="text-primary" />
            Public decks
          </h2>

          {publicOnly.length === 0 ? (
            <p className="text-sm text-muted">No public decks from other users yet.</p>
          ) : (
            <div className="grid gap-3">
              {publicOnly.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between gap-3 rounded-control border border-border px-3.5 py-3"
                >
                  <span className="min-w-0 truncate font-medium text-foreground">{deck.title}</span>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/flashcard-decks/${deck.id}`)}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">My decks</h2>

        {loading && <LoadingState label="Loading decks..." />}

        {!loading && mine.length === 0 && (
          <EmptyState
            icon={<CreditCard size={26} />}
            title="You don't have any decks yet"
            description="Create your first deck above to start studying."
          />
        )}

        {!loading && mine.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((deck) => (
              <Card key={deck.id} className="flex flex-col">
                {editingId === deck.id ? (
                  <>
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      aria-label="Deck title"
                    />
                    <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                      <Checkbox
                        checked={editingPublic}
                        onChange={(e) => setEditingPublic(e.target.checked)}
                      />
                      Public
                    </label>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => void saveEdit()}>
                        Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-soft text-primary">
                        <Layers size={17} />
                      </span>
                      <Badge
                        tone={deck.isPublic ? "success" : "neutral"}
                        icon={deck.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                      >
                        {deck.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>

                    <h3 className="mt-3 flex-1 truncate font-semibold text-foreground" title={deck.title}>
                      {deck.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/flashcard-decks/${deck.id}`)}
                      >
                        Study
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startEdit(deck)}
                        aria-label={`Edit ${deck.title}`}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleDeleteDeck(deck.id)}
                        aria-label={`Delete ${deck.title}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
