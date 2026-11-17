import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Download,
  FileDown,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { getFlashcardDeckById } from "../../api/flashcardDecks";
import {
  createFlashcard,
  deleteFlashcard,
  exportFlashcards,
  getFlashcardsByDeck,
  importFlashcards,
  updateFlashcard,
} from "../../api/flashcards";
import type { Flashcard } from "../../types/flashcard";
import type { FlashcardDeck } from "../../types/flashcardDeck";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Textarea } from "../../components/ui/Field";
import { EmptyState, LoadingState } from "../../components/ui/States";

const IMPORT_EXAMPLE_URL = "/flashcard-import-example.txt";

/**
 * Count how many cards the pasted text will produce, so the form can show live
 * feedback before submitting.
 *
 * Mirrors ImportFlashcardMapper._mapPlainText: skip blank/comment lines, and
 * require a " - " separator with something on both sides. Duplicated by hand
 * because the server is the authority - this is only a preview.
 */
function countPastedCards(text: string): number {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .filter((line) => {
      const at = line.indexOf(" - ");
      if (at === -1) return false;
      return Boolean(line.slice(0, at).trim()) && Boolean(line.slice(at + 3).trim());
    }).length;
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

export default function FlashcardStudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deckId = id || "";

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // Create form
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [creating, setCreating] = useState(false);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFront, setEditingFront] = useState("");
  const [editingBack, setEditingBack] = useState("");

  // Import / export
  const [importOpen, setImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<"file" | "paste">("file");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  // Keep the deck sorted without refetching from the server.
  function sortCards(next: Flashcard[]) {
    return [...next].sort((a, b) => a.order - b.order);
  }

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

  /**
   * Create a card and append it to local state.
   *
   * Deliberately does NOT call loadData(): refetching the whole deck on every
   * add would reset the study position and flash the list. The server returns
   * the created row, so it can be merged in directly.
   */
  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim() || !deckId) return;

    const nextOrder = cards.reduce((max, c) => Math.max(max, c.order ?? 0), 0) + 1;

    try {
      setCreating(true);
      setError(null);

      const created = await createFlashcard({
        deckId,
        frontText: frontText.trim(),
        backText: backText.trim(),
        order: nextOrder,
      });

      setCards((prev) => sortCards([...prev, created]));
      setFrontText("");
      setBackText("");
      setNotice("Card added.");
      frontRef.current?.focus();
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
      setError(null);
      const updated = await updateFlashcard(editingId, {
        frontText: editingFront.trim(),
        backText: editingBack.trim(),
      });
      setCards((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c)));
      setEditingId(null);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not update the card."));
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!window.confirm("Delete this flashcard?")) return;
    try {
      setError(null);
      await deleteFlashcard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setCurrentIndex((prev) => Math.max(0, Math.min(prev, cards.length - 2)));
      setShowBack(false);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not delete the card."));
    }
  }

  /** Whichever source the user picked, as a File the API can upload. */
  function buildImportFile(): File | null {
    if (importMode === "file") return importFile;

    const text = importText.trim();
    if (!text) return null;

    // The backend already understands .txt, so pasted text is wrapped in a File
    // rather than needing a second endpoint or a separate JSON payload.
    return new File([text], "pasted-cards.txt", { type: "text/plain" });
  }

  function resetImport() {
    setImportOpen(false);
    setImportFile(null);
    setImportText("");
    setImportMode("file");
  }

  async function handleImport() {
    const file = buildImportFile();
    if (!file || !deckId) return;

    try {
      setImporting(true);
      setError(null);

      const result = await importFlashcards({ file, deckId });

      // The response does not include the created rows, so refetch the deck
      // list once to pick them up.
      const cardData = await getFlashcardsByDeck(deckId);
      setCards(sortCards(cardData));

      resetImport();
      setNotice(
        `Imported ${result.imported} of ${result.totalCards} card${result.totalCards === 1 ? "" : "s"}.` +
          (result.failed > 0 ? ` ${result.failed} failed.` : "")
      );
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not import the cards."));
    } finally {
      setImporting(false);
    }
  }

  async function handleExport(format: "txt" | "csv") {
    if (!deckId) return;
    try {
      setExporting(true);
      setError(null);
      await exportFlashcards(deckId, format);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Could not export the deck."));
    } finally {
      setExporting(false);
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
      width="wide"
      title={deck?.title || "Flashcard deck"}
      subtitle={`${cards.length} card${cards.length === 1 ? "" : "s"} in this deck`}
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={15} />}
            onClick={() => setImportOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={15} />}
            loading={exporting}
            disabled={cards.length === 0}
            onClick={() => void handleExport("txt")}
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate("/flashcard-decks")}
          >
            All decks
          </Button>
        </>
      }
    >
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

      {/* Sidebar left, content right on wide screens; stacked on mobile. */}
      <div className="grid gap-5 lg:grid-cols-[340px_1fr] lg:items-start">
        {/* ---------- LEFT: create + import ---------- */}
        <div className="grid gap-4 lg:sticky lg:top-24">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Plus size={17} className="text-primary" />
              Add a card
            </h2>

            <form onSubmit={handleCreateCard} className="grid gap-4">
              <Field label="Front">
                {({ id: fieldId }) => (
                  <Textarea
                    id={fieldId}
                    ref={frontRef}
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    placeholder="The prompt shown first"
                    className="min-h-[70px]"
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
                    className="min-h-[70px]"
                  />
                )}
              </Field>

              <Button type="submit" loading={creating} fullWidth>
                {creating ? "Adding..." : "Add card"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <FileDown size={17} className="text-primary" />
              Bulk import
            </h2>
            <p className="mb-3 text-sm text-muted">
              Upload a <code className="text-xs">.txt</code>, <code className="text-xs">.csv</code>{" "}
              or <code className="text-xs">.json</code> file. One card per line,{" "}
              <code className="text-xs">front - back</code>.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
                Import file
              </Button>
              <a href={IMPORT_EXAMPLE_URL} download>
                <Button size="sm" variant="ghost" icon={<Download size={14} />}>
                  Example file
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* ---------- RIGHT: study + all cards ---------- */}
        <div className="grid gap-5">
          <Card>
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
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ChevronLeft size={15} />}
                    onClick={prevCard}
                  >
                    Previous
                  </Button>
                  <Button variant="secondary" size="sm" onClick={nextCard}>
                    Next
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                title="This deck has no cards yet"
                description="Add one on the left, or import a file."
              />
            )}
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
        </div>
      </div>

      <Modal
        open={importOpen}
        onClose={resetImport}
        title="Import flashcards"
        description="One card per line: front - back"
        footer={
          <>
            <Button variant="secondary" onClick={resetImport}>
              Cancel
            </Button>
            <Button
              icon={<Upload size={15} />}
              loading={importing}
              disabled={!buildImportFile()}
              onClick={() => void handleImport()}
            >
              {importing ? "Importing..." : "Import"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Alert tone="info">
            Maximum 500 cards per import. Lines starting with <code>#</code> are ignored.
          </Alert>

          {/* Mode switch */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={importMode === "file" ? "primary" : "secondary"}
              icon={<Upload size={14} />}
              onClick={() => setImportMode("file")}
            >
              Upload a file
            </Button>
            <Button
              size="sm"
              variant={importMode === "paste" ? "primary" : "secondary"}
              icon={<ClipboardPaste size={14} />}
              onClick={() => setImportMode("paste")}
            >
              Paste text
            </Button>
          </div>

          {importMode === "file" ? (
            <Field label="File" hint="Accepts .txt, .csv, .xlsx and .json">
              {({ id: fieldId, describedBy }) => (
                <input
                  id={fieldId}
                  aria-describedby={describedBy}
                  type="file"
                  accept=".txt,.csv,.xlsx,.xls,.json"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-muted file:mr-3 file:rounded-control file:border-0 file:bg-surface-sunken file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-border"
                />
              )}
            </Field>
          ) : (
            <Field
              label="Cards"
              hint={`${countPastedCards(importText)} card${countPastedCards(importText) === 1 ? "" : "s"} detected`}
            >
              {({ id: fieldId, describedBy }) => (
                <Textarea
                  id={fieldId}
                  aria-describedby={describedBy}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder={"Bustling - nhộn nhịp\noverwhelming - áp đảo"}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              )}
            </Field>
          )}

          <div className="rounded-control border border-border bg-surface-sunken p-3">
            <p className="mb-2 text-sm font-medium text-foreground">TXT format</p>
            <pre className="overflow-x-auto text-xs text-muted">
{`Bustling - nhộn nhịp
overwhelming - áp đảo`}
            </pre>
            <a
              href={IMPORT_EXAMPLE_URL}
              download
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Download size={14} />
              Download the example file
            </a>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
