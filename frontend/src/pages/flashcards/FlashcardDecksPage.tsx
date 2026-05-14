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
import AppHeader from "../../components/AppHeader";

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
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 10%, #f0fdf4 0%, #e0f2fe 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .decks-wrap {
          max-width: 1100px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .decks-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 8px;
        }
        .decks-subtitle {
          margin: 0 0 18px;
          color: #475569;
        }
        .decks-grid {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) minmax(280px, 360px);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .decks-grid {
            grid-template-columns: 1fr;
          }
        }
        .panel {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 18px 20px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .form-grid {
          display: grid;
          gap: 10px;
        }
        .field-input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5f5;
          background: #f8fafc;
        }
        .field-input:focus {
          outline: none;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
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
        .primary-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .deck-card {
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 14px 16px;
          background: #ffffff;
          display: grid;
          gap: 8px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
        .deck-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .deck-button {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          font-weight: 600;
        }
        .deck-button--primary {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }
        .error-box {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .section-title {
          margin: 0 0 12px;
        }
      `}</style>
      <main className="decks-wrap">
        <h1 className="decks-title">Flashcard Decks</h1>
        <p className="decks-subtitle">Create new deck or study public decks.</p>

        {error && <div className="error-box">{error}</div>}

        <div className="decks-grid">
          <section className="panel">
            <h2 className="section-title">Create New Deck</h2>
            <form onSubmit={handleCreateDeck} className="form-grid">
              <input
                className="field-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck Title"
              />
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Public deck
              </label>
              <button className="primary-button" disabled={submitting} type="submit">
                {submitting ? "Creating..." : "Create Deck"}
              </button>
            </form>
          </section>

          <section className="panel">
            <h2 className="section-title">Public Decks</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {publicOnly.map((deck) => (
                <div key={deck.id} className="deck-card">
                  <div style={{ fontWeight: 600 }}>{deck.title}</div>
                  <button
                    className="deck-button deck-button--primary"
                    onClick={() => navigate(`/flashcard-decks/${deck.id}`)}
                  > 
                    Open deck
                  </button>
                </div>
              ))}
              {publicOnly.length === 0 && <div>No public decks available.</div>}
            </div>
          </section>
        </div>

        <section style={{ marginTop: 22 }}>
          <h2 className="section-title">My Decks</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {mine.map((deck) => (
              <div key={deck.id} className="deck-card">
                {editingId === deck.id ? (
                  <>
                    <input
                      className="field-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={editingPublic}
                        onChange={(e) => setEditingPublic(e.target.checked)}
                      />
                      Public
                    </label>
                    <div className="deck-actions">
                      <button className="deck-button deck-button--primary" onClick={() => void saveEdit()}>
                        Save
                      </button>
                      <button className="deck-button" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600 }}>{deck.title}</div>
                    <div style={{ color: "#6b7280" }}>{deck.isPublic ? "Public" : "Private"}</div>
                    <div className="deck-actions">
                      <button className="deck-button deck-button--primary" onClick={() => navigate(`/flashcard-decks/${deck.id}`)}>
                        Open
                      </button>
                      <button className="deck-button" onClick={() => startEdit(deck)}>
                        Edit
                      </button>
                      <button className="deck-button" onClick={() => void handleDeleteDeck(deck.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {mine.length === 0 && <div>You have no decks.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
