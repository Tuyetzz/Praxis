import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTypingText } from "../../api/typingTexts";
import type { TypingTextDifficulty } from "../../types/typingText";

function summarizeText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const sentences = trimmed.split(/(?<=[.!?])\s+/).slice(0, 3).join(" ");
  return sentences || trimmed.slice(0, 300);
}

export default function AiTextPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [difficulty, setDifficulty] = useState<TypingTextDifficulty>("medium");
  const [language, setLanguage] = useState("english");
  const [isPublic, setIsPublic] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSummarize = () => {
    const nextSummary = summarizeText(inputText);
    setSummary(nextSummary);
  };

  const handleSave = async () => {
    const content = summary.trim() || inputText.trim();
    if (!content) {
      setError("Please provide text or a summary before saving.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await createTypingText({
        title: title.trim() || "AI Summary",
        content,
        difficulty,
        language,
        isPublic,
        sourceType: "ai_summary",
      });
      navigate("/practice/select");
    } catch {
      setError("Unable to save the generated text.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">AI Text Generator</h1>
          <p className="text-gray-300">
            Upload a document or paste text, then generate a typing-friendly summary.
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-slate-600 text-white border border-slate-500 rounded-lg p-3"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="bg-slate-600 text-white border border-slate-500 rounded-lg p-3"
              placeholder="Language (english)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            <select
              className="bg-slate-600 text-white border border-slate-500 rounded-lg p-3"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as TypingTextDifficulty)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <label className="flex items-center gap-2 text-gray-200">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public text
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Upload PDF/Word</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileName(file ? file.name : null);
              }}
              className="text-gray-200"
            />
            {fileName && <p className="text-gray-400 mt-2">Selected: {fileName}</p>}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <label className="block text-sm text-gray-300 mb-2">Source Text</label>
          <textarea
            className="w-full bg-slate-600 text-white border border-slate-500 rounded-lg p-3 min-h-[180px]"
            placeholder="Paste text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSummarize}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Summarize
            </button>
            <button
              onClick={() => {
                setInputText("");
                setSummary("");
              }}
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-6">
          <label className="block text-sm text-gray-300 mb-2">Summary Output</label>
          <textarea
            className="w-full bg-slate-600 text-white border border-slate-500 rounded-lg p-3 min-h-[160px]"
            placeholder="Summary will appear here..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          {error && <p className="text-amber-300 mt-3">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save to Text Library"}
            </button>
            <button
              onClick={() => navigate("/practice/select")}
              className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Back to Texts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
