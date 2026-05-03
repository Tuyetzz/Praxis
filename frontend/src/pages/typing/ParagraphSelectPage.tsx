import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Pencil, Plus, Sparkles, Trash2, RefreshCcw } from "lucide-react";
import type { TypingText, TypingTextDifficulty } from "../../types/typingText";
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
    await deleteTypingText(text.id);
    await loadTexts();
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    setFormError(null);
    if (editingId) {
      await updateTypingText(editingId, form);
    } else {
      await createTypingText(form);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    await loadTexts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold text-white">Select a Text</h1>
                <p className="text-gray-300 text-lg">
                  Pick a text to practice or manage your own library.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/practice/typing")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Fast Type
              </button>
              <button
                onClick={() => navigate("/practice/typing/ai")}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <Sparkles size={18} />
                AI Summarize
              </button>
              <button
                onClick={loadTexts}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Create / Edit Form */}
        <div className="bg-slate-700 rounded-lg p-6 mb-10">
          <div className="flex items-center gap-2 mb-4 text-white font-semibold">
            <Plus size={18} />
            {editingId ? "Update Text" : "Create Text"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-slate-600 text-white border border-slate-500 rounded-lg p-3"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              className="bg-slate-600 text-white border border-slate-500 rounded-lg p-3"
              placeholder="Language (english)"
              value={form.language}
              onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
            />
            <select
              className="bg-slate-600 text-white border border-slate-500 rounded-lg p-3"
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
            <label className="flex items-center gap-2 text-gray-200">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
              />
              Public text
            </label>
          </div>
          <textarea
            className="w-full bg-slate-600 text-white border border-slate-500 rounded-lg p-3 mt-4 min-h-[140px]"
            placeholder="Text content"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          />
          {formError && <p className="text-amber-300 mt-3">{formError}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
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
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Text Sections */}
        <div className="grid grid-cols-1 gap-10">
          <section>
            <h2 className="text-2xl text-white font-semibold mb-4">My Texts</h2>
            {loading ? (
              <p className="text-gray-300">Loading...</p>
            ) : myTexts.length === 0 ? (
              <p className="text-gray-300">No texts yet. Create your first one above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTexts.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`bg-slate-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      selectedId === snippet.id ? "ring-2 ring-blue-400" : ""
                    }`}
                    onClick={() => setSelectedId(snippet.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-white truncate">
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

                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {snippet.content}
                      </p>

                      <div className="flex justify-between text-sm text-gray-400 mb-6 border-t border-gray-600 pt-4">
                        <span>{snippet.content.split(" ").length} words</span>
                        <span>{snippet.content.length} characters</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSelect(snippet)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          Start
                          <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(snippet)}
                          className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center gap-1"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(snippet)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center gap-1"
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
            <h2 className="text-2xl text-white font-semibold mb-4">Public Texts</h2>
            {loading ? (
              <p className="text-gray-300">Loading...</p>
            ) : publicTexts.length === 0 ? (
              <p className="text-gray-300">No public texts available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicTexts.map((snippet) => (
                  <div
                    key={snippet.id}
                    className={`bg-slate-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      selectedId === snippet.id ? "ring-2 ring-blue-400" : ""
                    }`}
                    onClick={() => setSelectedId(snippet.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-white truncate">
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

                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {snippet.content}
                      </p>

                      <div className="flex justify-between text-sm text-gray-400 mb-6 border-t border-gray-600 pt-4">
                        <span>{snippet.content.split(" ").length} words</span>
                        <span>{snippet.content.length} characters</span>
                      </div>

                      <button
                        onClick={() => handleSelect(snippet)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
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
  );
}
