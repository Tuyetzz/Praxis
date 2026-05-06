import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFlashcardDeckById } from "../../api/flashcardDecks";
import { createFlashcard, deleteFlashcard, getFlashcardsByDeck, updateFlashcard } from "../../api/flashcards";
import type { Flashcard } from "../../types/flashcard";
import type { FlashcardDeck } from "../../types/flashcardDeck";
import AppHeader from "../../components/AppHeader";

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
      const [deckData, cardData] = await Promise.all([getFlashcardDeckById(deckId), getFlashcardsByDeck(deckId)]);
      setDeck(deckData);
      setCards(cardData.sort((a, b) => a.order - b.order));
      setCurrentIndex(0);
      setShowBack(false);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Không tải được deck hoặc flashcards.";
      setError(message || "Không tải được deck hoặc flashcards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
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
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Tạo flashcard thất bại.";
      setError(message || "Tạo flashcard thất bại.");
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
      await updateFlashcard(editingId, { frontText: editingFront.trim(), backText: editingBack.trim() });
      setEditingId(null);
      await loadData();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Cập nhật flashcard thất bại.";
      setError(message || "Cập nhật flashcard thất bại.");
    }
  }

  async function handleDeleteCard(cardId: string) {
    const ok = window.confirm("Xóa flashcard này?");
    if (!ok) return;

    try {
      await deleteFlashcard(cardId);
      await loadData();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Xóa flashcard thất bại.";
      setError(message || "Xóa flashcard thất bại.");
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Đang tải flashcards...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 10%, #fef3c7 0%, #e0f2fe 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .study-wrap {
          max-width: 1100px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .study-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 6px;
        }
        .study-subtitle {
          margin: 0 0 16px;
          color: #475569;
        }
        .panel {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 18px 20px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          margin-bottom: 18px;
        }
        .card-button {
          width: 100%;
          text-align: left;
          min-height: 140px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          background: #f8fafc;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }
        .nav-buttons {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .action-button {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-weight: 600;
          cursor: pointer;
        }
        .primary-button {
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
        }
        .field-input,
        .field-textarea {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5f5;
          background: #f8fafc;
        }
        .field-textarea {
          min-height: 80px;
        }
        .list-grid {
          display: grid;
          gap: 10px;
        }
        .list-card {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 12px 14px;
          background: #ffffff;
        }
        .error-box {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
      `}</style>
      <main className="study-wrap">
        <h1 className="study-title">{deck?.title || "Flashcard Deck"}</h1>
        <div className="study-subtitle">Total cards: {cards.length}</div>

        {error && <div className="error-box">{error}</div>}

        <section className="panel">
          <h2>Study Flashcards</h2>
          {currentCard ? (
            <>
              <button className="card-button" onClick={() => setShowBack((v) => !v)}>
                {showBack ? currentCard.backText : currentCard.frontText}
              </button>
              <div style={{ marginTop: 10, color: "#6b7280" }}>
                Click on the card to flip | {currentIndex + 1}/{cards.length}
              </div>
              <div className="nav-buttons">
                <button className="action-button" onClick={prevCard}>Prev</button>
                <button className="action-button" onClick={nextCard}>Next</button>
              </div>
            </>
          ) : (
            <div>Deck has no flashcards.</div>
          )}
        </section>

        <section className="panel">
          <h2>Create New Flashcard</h2>
          <form onSubmit={handleCreateCard} style={{ display: "grid", gap: 10, maxWidth: 600 }}>
            <textarea
              className="field-textarea"
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              placeholder="Front"
            />
            <textarea
              className="field-textarea"
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              placeholder="Back"
            />
            <input
              className="field-input"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value || 0))}
              placeholder="Order"
              style={{ width: 140 }}
            />
            <button className="primary-button" disabled={creating} type="submit">
              {creating ? "Creating..." : "Create Flashcard"}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Flashcard List</h2>
          <div className="list-grid">
            {cards.map((card) => (
              <article key={card.id} className="list-card">
                {editingId === card.id ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <textarea
                      className="field-textarea"
                      value={editingFront}
                      onChange={(e) => setEditingFront(e.target.value)}
                    />
                    <textarea
                      className="field-textarea"
                      value={editingBack}
                      onChange={(e) => setEditingBack(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="primary-button" onClick={() => void saveEditCard()}>Save</button>
                      <button className="action-button" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600 }}>Front: {card.frontText}</div>
                    <div style={{ marginTop: 4 }}>Back: {card.backText}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <button className="action-button" onClick={() => startEditCard(card)}>Edit</button>
                      <button className="action-button" onClick={() => void handleDeleteCard(card.id)}>Delete</button>
                    </div>
                  </>
                )}
              </article>
            ))}
            {cards.length === 0 && <div>You have no flashcards.</div>}
          </div>
        </section>

        <div style={{ marginTop: 16 }}>
          <button className="primary-button" onClick={() => navigate("/flashcard-decks")}>Back to decks</button>
        </div>
      </main>
    </div>
  );
}
