import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createFlashcardDeck,
  deleteFlashcardDeck,
  getMyFlashcardDecks,
  getPublicFlashcardDecks,
  updateFlashcardDeck,
} from "../../api/flashcardDecks";
import type { FlashcardDeck } from "../../types/flashcardDeck";

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
      const [myDecks, pubDecks] = await Promise.all([getMyFlashcardDecks(), getPublicFlashcardDecks()]);
      setMine(myDecks);
      setPublicDecks(pubDecks);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Không tải được danh sách flashcard decks.";
      setError(message || "Không tải được danh sách flashcard decks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

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
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Tạo deck thất bại.";
      setError(message || "Tạo deck thất bại.");
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
      await updateFlashcardDeck(editingId, { title: editingTitle.trim(), isPublic: editingPublic });
      setEditingId(null);
      await loadData();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Cập nhật deck thất bại.";
      setError(message || "Cập nhật deck thất bại.");
    }
  }

  async function handleDeleteDeck(id: string) {
    const ok = window.confirm("Xóa deck này?");
    if (!ok) return;

    try {
      await deleteFlashcardDeck(id);
      await loadData();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Xóa deck thất bại.";
      setError(message || "Xóa deck thất bại.");
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Đang tải flashcard decks...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 12 }}>Flashcard Decks</h1>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", padding: 10, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCreateDeck} style={{ display: "grid", gap: 8, maxWidth: 500, marginBottom: 20 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên deck"
          style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Public deck
        </label>
        <button disabled={submitting} type="submit">
          {submitting ? "Đang tạo..." : "Tạo deck"}
        </button>
      </form>

      <section style={{ marginBottom: 20 }}>
        <h2>Deck của tôi</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {mine.map((deck) => (
            <div
              key={deck.id}
              style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, display: "grid", gap: 8 }}
            >
              {editingId === deck.id ? (
                <>
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    style={{ padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={editingPublic}
                      onChange={(e) => setEditingPublic(e.target.checked)}
                    />
                    Public
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => void saveEdit()}>Lưu</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600 }}>{deck.title}</div>
                  <div style={{ color: "#6b7280" }}>{deck.isPublic ? "Public" : "Private"}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => navigate(`/flashcard-decks/${deck.id}`)}>Mở</button>
                    <button onClick={() => startEdit(deck)}>Sửa</button>
                    <button onClick={() => void handleDeleteDeck(deck.id)}>Xóa</button>
                  </div>
                </>
              )}
            </div>
          ))}
          {mine.length === 0 && <div>Chưa có deck nào.</div>}
        </div>
      </section>

      <section>
        <h2>Deck Public</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {publicOnly.map((deck) => (
            <div key={deck.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{deck.title}</div>
              <button style={{ marginTop: 8 }} onClick={() => navigate(`/flashcard-decks/${deck.id}`)}>
                Mở deck
              </button>
            </div>
          ))}
          {publicOnly.length === 0 && <div>Không có deck public nào.</div>}
        </div>
      </section>
    </div>
  );
}
