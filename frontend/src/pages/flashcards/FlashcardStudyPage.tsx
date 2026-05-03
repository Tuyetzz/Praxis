import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFlashcardDeckById } from "../../api/flashcardDecks";
import { createFlashcard, deleteFlashcard, getFlashcardsByDeck, updateFlashcard } from "../../api/flashcards";
import type { Flashcard } from "../../types/flashcard";
import type { FlashcardDeck } from "../../types/flashcardDeck";

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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>{deck?.title || "Flashcard Deck"}</h1>
      <div style={{ color: "#6b7280", marginBottom: 16 }}>
        Tổng số thẻ: {cards.length}
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 10, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Học flashcard</h2>
        {currentCard ? (
          <>
            <button
              style={{
                width: "100%",
                textAlign: "left",
                minHeight: 120,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
                cursor: "pointer",
                fontSize: 16,
              }}
              onClick={() => setShowBack((v) => !v)}
            >
              {showBack ? currentCard.backText : currentCard.frontText}
            </button>
            <div style={{ marginTop: 10, color: "#6b7280" }}>
              Nhấn vào card để flip | {currentIndex + 1}/{cards.length}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button onClick={prevCard}>Prev</button>
              <button onClick={nextCard}>Next</button>
            </div>
          </>
        ) : (
          <div>Deck chưa có flashcard.</div>
        )}
      </section>

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Tạo flashcard mới</h2>
        <form onSubmit={handleCreateCard} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
          <textarea
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            placeholder="Mặt trước"
            style={{ minHeight: 70, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
          <textarea
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
            placeholder="Mặt sau"
            style={{ minHeight: 70, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value || 0))}
            placeholder="Order"
            style={{ width: 120, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
          />
          <button disabled={creating} type="submit">
            {creating ? "Đang tạo..." : "Tạo flashcard"}
          </button>
        </form>
      </section>

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
        <h2>Danh sách flashcard</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {cards.map((card) => (
            <article key={card.id} style={{ border: "1px solid #f3f4f6", borderRadius: 8, padding: 10 }}>
              {editingId === card.id ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <textarea
                    value={editingFront}
                    onChange={(e) => setEditingFront(e.target.value)}
                    style={{ minHeight: 60, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                  />
                  <textarea
                    value={editingBack}
                    onChange={(e) => setEditingBack(e.target.value)}
                    style={{ minHeight: 60, padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => void saveEditCard()}>Lưu</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 600 }}>Front: {card.frontText}</div>
                  <div style={{ marginTop: 4 }}>Back: {card.backText}</div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button onClick={() => startEditCard(card)}>Sửa</button>
                    <button onClick={() => void handleDeleteCard(card.id)}>Xóa</button>
                  </div>
                </>
              )}
            </article>
          ))}
          {cards.length === 0 && <div>Chưa có flashcard.</div>}
        </div>
      </section>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/flashcard-decks")}>Back to decks</button>
      </div>
    </div>
  );
}
