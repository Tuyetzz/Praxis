import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Pencil, Plus, Sparkles, Trash2, RefreshCcw } from "lucide-react";
import type { TypingText, TypingTextDifficulty } from "../../types/typingText";
import AppHeader from "../../components/AppHeader";
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

export default function ParagraphSelectPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      const [mine, publics] = await Promise.all([
        getMyTypingTexts(),
        getPublicTypingTexts(),
      ]);
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

  const getDifficultyColor = (difficulty: TypingTextDifficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
  };

  const handleDelete = async (text: TypingText) => {
    if (!window.confirm(`Delete "${text.title}"?`)) return;
    setFormError(null);
    setDeletingId(text.id);
    try {
      await deleteTypingText(text.id);
      await loadTexts();
    } catch {
      setFormError("Unable to delete the selected text.");
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
      setFormError("Unable to save the text. Please try again.");
    }
  };

  const defaultTexts = publicTexts.filter((text) => text.isDefault);
  const sharedPublicTexts = publicTexts.filter((text) => !text.isDefault);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 20%, #ecfeff 0%, #f8fafc 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .typing-wrap {
          max-width: 1100px;
          margin: 28px auto 60px;
          padding: 0 20px 44px;
        }
        .typing-hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
          align-items: center;
          margin-bottom: 20px;
        }
        .typing-panel {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 18px 20px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .typing-panel--dark {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          border: none;
        }
        .typing-input {
          background: #f8fafc;
          border: 1px solid #cbd5f5;
          border-radius: 12px;
          padding: 12px 14px;
          color: #0f172a;
        }
        .typing-input:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
        }
        .typing-button {
          border-radius: 12px;
          font-weight: 600;
          padding: 10px 16px;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .typing-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }
        .text-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
        }
      `}</style>
      <div className="min-h-screen">
        <div className="typing-wrap">
          <div className="typing-hero">
            <div>
              <div className="flex items-center gap-3">
                <BookOpen size={30} className="text-teal-600" />
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Select a Text</h1>
                  <p className="text-slate-600 text-lg">
                    Pick a text to practice or manage your own library.
                  </p>
                </div>
              </div>
            </div>
            <div className="typing-panel typing-panel--dark">
              <h3 className="text-lg font-semibold mb-1">Quick actions</h3>
              <p className="text-slate-200/80">Create, summarize, or revisit your typing history.</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => navigate("/practice/typing/history")}
                  className="typing-button bg-white/10 text-white"
                >
                  History
                </button>
                <button
                  onClick={() => navigate("/practice/typing/ai")}
                  className="typing-button bg-emerald-400 text-slate-900 flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  AI Summarize
                </button>
                <button
                  onClick={loadTexts}
                  className="typing-button bg-white/10 text-white flex items-center gap-2"
                >
                  <RefreshCcw size={18} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="typing-panel mb-10">
          <div className="flex items-center gap-2 mb-4 text-white font-semibold">
            <Plus size={18} />
            {editingId ? "Update Text" : "Create Text"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="typing-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              className="typing-input"
              placeholder="Language (english)"
              value={form.language}
              onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
            />
            <select
              className="typing-input"
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
            </select>
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
              />
              Public text
            </label>
          </div>
          <textarea
            className="w-full typing-input mt-4 min-h-[140px]"
            placeholder="Text content"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          />
          {formError && <p className="text-rose-600 mt-3">{formError}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              className="typing-button bg-slate-900 text-white"
            >
              {editingId ? "Save Changes" : "Create Text"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setFormError(null);
                }}
                className="typing-button bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

          <div className="grid grid-cols-1 gap-10">
          <section>
            <h2 className="text-2xl text-slate-900 font-semibold mb-4">My Texts</h2>
            {loading ? (
              <p className="text-slate-600">Loading...</p>
            ) : myTexts.length === 0 ? (
              <p className="text-slate-600">No texts yet. Create your first one above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTexts.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`text-card overflow-hidden hover:shadow-emerald-200/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      selectedId === snippet.id ? "ring-2 ring-emerald-400" : ""
                    }`}
                    onClick={() => setSelectedId(snippet.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 truncate">
                          {snippet.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getDifficultyColor(
                            snippet.difficulty
                          )}`}
                        >
                          {snippet.difficulty}
                        </span>
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {snippet.content}
                      </p>

                      <div className="flex justify-between text-sm text-slate-500 mb-6 border-t border-slate-200 pt-4">
                        <span>{snippet.content.split(" ").length} words</span>
                        <span>{snippet.content.length} characters</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSelect(snippet)}
                          className="flex-1 typing-button bg-slate-900 text-white flex items-center justify-center gap-2"
                        >
                          Start
                          <ChevronRight size={10} />
                        </button>
                        <button
                          onClick={() => handleEdit(snippet)}
                          className="typing-button bg-slate-100 text-slate-700 flex items-center gap-1"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(snippet)}
                          disabled={deletingId === snippet.id}
                          className="typing-button bg-rose-500 text-white flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl text-slate-900 font-semibold mb-4">Default Texts</h2>
            {loading ? (
              <p className="text-slate-600">Loading...</p>
            ) : defaultTexts.length === 0 ? (
              <p className="text-slate-600">No default texts available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultTexts.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`text-card overflow-hidden hover:shadow-emerald-200/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      selectedId === snippet.id ? "ring-2 ring-emerald-400" : ""
                    }`}
                    onClick={() => setSelectedId(snippet.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 truncate">
                          {snippet.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getDifficultyColor(
                            snippet.difficulty
                          )}`}
                        >
                          {snippet.difficulty}
                        </span>
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {snippet.content}
                      </p>

                      <div className="flex justify-between text-sm text-slate-500 mb-6 border-t border-slate-200 pt-4">
                        <span>{snippet.content.split(" ").length} words</span>
                        <span>{snippet.content.length} characters</span>
                      </div>

                        <button
                          onClick={() => handleSelect(snippet)}
                          className="w-full typing-button bg-slate-900 text-white flex items-center justify-center gap-2"
                        >
                          Start
                          <ChevronRight size={18} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl text-slate-900 font-semibold mb-4">Public Texts</h2>
            {loading ? (
              <p className="text-slate-600">Loading...</p>
            ) : sharedPublicTexts.length === 0 ? (
              <p className="text-slate-600">No public texts available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedPublicTexts.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`text-card overflow-hidden hover:shadow-emerald-200/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      selectedId === snippet.id ? "ring-2 ring-emerald-400" : ""
                    }`}
                    onClick={() => setSelectedId(snippet.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 truncate">
                          {snippet.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getDifficultyColor(
                            snippet.difficulty
                          )}`}
                        >
                          {snippet.difficulty}
                        </span>
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {snippet.content}
                      </p>

                      <div className="flex justify-between text-sm text-slate-500 mb-6 border-t border-slate-200 pt-4">
                        <span>{snippet.content.split(" ").length} words</span>
                        <span>{snippet.content.length} characters</span>
                      </div>

                        <button
                          onClick={() => handleSelect(snippet)}
                          className="w-full typing-button bg-slate-900 text-white flex items-center justify-center gap-2"
                        >
                          Start
                          <ChevronRight size={18} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
            </div>
          </div>
      </div>
    </div>
  );
}
