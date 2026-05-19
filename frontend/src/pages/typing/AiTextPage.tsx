import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTypingText, summarizeTypingText } from "../../api/typingTexts";
import type { TypingTextDifficulty } from "../../types/typingText";
import AppHeader from "../../components/AppHeader";

export default function AiTextPage() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [title, setTitle] = useState("");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [difficulty, setDifficulty] = useState<TypingTextDifficulty>("medium");
  const [language, setLanguage] = useState("english");
  const [isPublic, setIsPublic] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (inputMode !== "text") return;
    const textValue = inputText.trim();
    if (!textValue) {
      setError("Please paste text before summarizing.");
      return;
    }

    if (!aiBaseUrl.trim()) {
      setError("Please paste your ngrok base URL before summarizing.");
      return;
    }

    setError(null);
    setSummarizing(true);
    try {
      const data = await summarizeTypingText({
        baseUrl: aiBaseUrl.trim(),
        text: textValue,
      });
      const nextSummary = data.summary ?? "";
      if (!nextSummary) {
        throw new Error("Missing summary");
      }
      setSummary(nextSummary);
    } catch {
      setError("Unable to generate summary from the AI service.");
    } finally {
      setSummarizing(false);
    }
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
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 10%, #ecfeff 0%, #f8fafc 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .ai-wrap {
          max-width: 980px;
          margin: 28px auto 60px;
          padding: 0 20px 44px;
        }
        .ai-hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
          align-items: center;
          margin-bottom: 24px;
        }
        .ai-panel {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 18px 20px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .ai-panel--dark {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          border: none;
        }
        .ai-input {
          background: #f8fafc;
          border: 1px solid #cbd5f5;
          border-radius: 12px;
          padding: 12px 14px;
          color: #0f172a;
        }
        .ai-input:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
        }
        .ai-button {
          border-radius: 12px;
          font-weight: 600;
          padding: 10px 16px;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .ai-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }
      `}</style>
      <div className="min-h-screen">
        <div className="ai-wrap">
          <div className="ai-hero">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Text Generator</h1>
              <p className="text-slate-600">
                Generate a typing-friendly summary from text or a file.
              </p>
            </div>
            <div className="ai-panel ai-panel--dark">
              <h3 className="text-lg font-semibold mb-1">Quick tips</h3>
              <p className="text-slate-200/80">
                Add a title and keep summaries around 3 to 5 sentences for best results.
              </p>
            </div>
          </div>

          <div className="ai-panel mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="ai-input"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="ai-input"
                placeholder="Ngrok base URL (https://xxxx.ngrok-free.app)"
                value={aiBaseUrl}
                onChange={(e) => setAiBaseUrl(e.target.value)}
              />
              <input
                className="ai-input"
                placeholder="Language (english)"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <select
                className="ai-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TypingTextDifficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public text
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setInputMode("text")}
                className={`ai-button ${
                  inputMode === "text"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Input Text
              </button>
              <button
                onClick={() => setInputMode("file")}
                className={`ai-button ${
                  inputMode === "file"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {inputMode === "file" ? (
            <div className="ai-panel mb-6">
              <label className="block text-sm text-slate-600 mb-2">Upload PDF/Word</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file ? file.name : null);
                }}
                className="text-slate-700"
              />
              {fileName && <p className="text-slate-500 mt-2">Selected: {fileName}</p>}
            </div>
          ) : (
            <div className="ai-panel mb-6">
              <label className="block text-sm text-slate-600 mb-2">Source Text</label>
              <textarea
                className="w-full ai-input min-h-[180px]"
                placeholder="Paste text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="ai-button bg-slate-900 text-white disabled:opacity-60"
                >
                  {summarizing ? "Summarizing..." : "Summarize"}
                </button>
                <button
                  onClick={() => {
                    setInputText("");
                    setSummary("");
                  }}
                  className="ai-button bg-slate-100 text-slate-700"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="ai-panel">
            <label className="block text-sm text-slate-600 mb-2">Summary Output</label>
            <textarea
              className="w-full ai-input min-h-[160px]"
              placeholder="Summary will appear here..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            {error && <p className="text-rose-600 mt-3">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="ai-button bg-slate-900 text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save to Text Library"}
              </button>
              <button
                onClick={() => navigate("/practice/select")}
                className="ai-button bg-slate-100 text-slate-700"
              >
                Back to Texts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
