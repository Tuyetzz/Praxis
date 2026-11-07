import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { getFlashcardDeckById } from "../../api/flashcardDecks";
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcardsByDeck,
  updateFlashcard,
} from "../../api/flashcards";
import type { Flashcard } from "../../types/flashcard";
import type { FlashcardDeck } from "../../types/flashcardDeck";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Field, Input, Textarea } from "../../components/ui/Field";
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

export default function FlashcardStudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deckId = id || "";

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [order, setOrder] = useState(0);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFront, setEditingFront] = useState("");
  const [editingBack, setEditingBack] = useState("");

  async function loadData() {
    if (!deckId) return;

    setLoading(true);
    setError(null);

    try {
      const [deckData, cardData] = await Promise.all([
        getFlashcardDeckById(deckId),
        getFlashcardsByDeck(deckId),
      ]);
      setDeck(deckData);
      setCards([...cardData].sort((a, b) => a.order - b.order));
      setCurrentIndex(0);
      setShowBack(false);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not load this deck."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const currentCard = useMemo(() => {
    if (cards.length === 0) return null;
    return cards[Math.min(currentIndex, cards.length - 1)];
  }, [cards, currentIndex]);

  function nextCard() {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setShowBack(false);
  }

  function prevCard() {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setShowBack(false);
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim() || !deckId) return;

    try {
      setCreating(true);
      await createFlashcard({
        deckId,
        frontText: frontText.trim(),
        backText: backText.trim(),
        order,
      });
      setFrontText("");
      setBackText("");
      setOrder(0);
      await loadData();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not create the card."));
    } finally {
      setCreating(false);
    }
  }

  function startEditCard(card: Flashcard) {
    setEditingId(card.id);
    setEditingFront(card.frontText);
    setEditingBack(card.backText);
  }

  async function saveEditCard() {
    if (!editingId) return;
    try {
      await updateFlashcard(editingId, {
        frontText: editingFront.trim(),
        backText: editingBack.trim(),
      });
      setEditingId(null);
      await loadData();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not update the card."));
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!window.confirm("Delete this flashcard?")) return;
    try {
      await deleteFlashcard(cardId);
      await loadData();
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not delete the card."));
    }
  }

  if (loading) {
    return (
      <PageShell width="md">
        <LoadingState label="Loading flashcards..." />
      </PageShell>
    );
  }

  return (
    <PageShell
      width="md"
      title={deck?.title || "Flashcard deck"}
      subtitle={`${cards.length} card${cards.length === 1 ? "" : "s"} in this deck`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate("/flashcard-decks")}
        >
          All decks
        </Button>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="mb-5">
        <h2 className="mb-4 font-semibold text-foreground">Study</h2>

        {currentCard ? (
          <>
            <button
              type="button"
              onClick={() => setShowBack((v) => !v)}
              className="flex min-h-[160px] w-full items-center justify-center rounded-card border border-border bg-surface-sunken px-6 py-8 text-center text-lg font-semibold text-foreground transition-all duration-200 ease-smooth hover:border-primary/40 hover:shadow-lift"
              aria-live="polite"
            >
              {showBack ? currentCard.backText : currentCard.frontText}
            </button>

            <p className="mt-3 text-center text-sm text-muted">
              Click the card to flip · {currentIndex + 1} / {cards.length}
            </p>

            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" size="sm" icon={<ChevronLeft size={15} />} onClick={prevCard}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" onClick={nextCard}>
                Next
                <ChevronRight size={15} />
              </Button>
            </div>
          </>
        ) : (
          <EmptyState title="This deck has no cards yet" description="Add your first card below." />
        )}
      </Card>

      <Card className="mb-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Plus size={17} className="text-primary" />
          Add a card
        </h2>

        <form onSubmit={handleCreateCard} className="grid gap-4">
          <Field label="Front">
            {({ id: fieldId }) => (
              <Textarea
                id={fieldId}
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                placeholder="The prompt shown first"
                className="min-h-[80px]"
              />
            )}
          </Field>

          <Field label="Back">
            {({ id: fieldId }) => (
              <Textarea
                id={fieldId}
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                placeholder="The answer revealed on flip"
                className="min-h-[80px]"
              />
            )}
          </Field>

          <Field label="Order" hint="Lower numbers appear first.">
            {({ id: fieldId }) => (
              <Input
                id={fieldId}
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value || 0))}
                className="max-w-[140px]"
              />
            )}
          </Field>

          <Button type="submit" loading={creating} className="justify-self-start">
            {creating ? "Adding..." : "Add card"}
          </Button>
        </form>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">All cards</h2>

        {cards.length === 0 ? (
          <p className="text-sm text-muted">No cards in this deck yet.</p>
        ) : (
          <div className="grid gap-3">
            {cards.map((card, index) => (
              <Card key={card.id}>
                {editingId === card.id ? (
                  <div className="grid gap-3">
                    <Textarea
                      value={editingFront}
                      onChange={(e) => setEditingFront(e.target.value)}
                      aria-label="Front"
                      className="min-h-[70px]"
                    />
                    <Textarea
                      value={editingBack}
                      onChange={(e) => setEditingBack(e.target.value)}
                      aria-label="Back"
                      className="min-h-[70px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => void saveEditCard()}>
                        Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <Badge tone="neutral">#{index + 1}</Badge>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditCard(card)}
                          aria-label="Edit card"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDeleteCard(card.id)}
                          aria-label="Delete card"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 font-medium text-foreground">{card.frontText}</p>
                    <p className="mt-1 text-sm text-muted">{card.backText}</p>
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
