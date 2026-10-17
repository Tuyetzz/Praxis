import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, Wand2 } from "lucide-react";
import { createTypingText, summarizeTypingText } from "../../api/typingTexts";
import type { TypingTextDifficulty } from "../../types/typingText";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "../../components/ui/Field";

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
    const textValue = inputText.trim();
    if (!textValue) {
      setError("Please paste some text before summarizing.");
      return;
    }

    if (!aiBaseUrl.trim()) {
      setError("Please paste your ngrok base URL before summarizing.");
      return;
    }

    setError(null);
    setSummarizing(true);
    try {
      const data = await summarizeTypingText({ baseUrl: aiBaseUrl.trim(), text: textValue });
      const nextSummary = data.summary ?? "";
      if (!nextSummary) throw new Error("Missing summary");
      setSummary(nextSummary);
    } catch {
      setError("Could not generate a summary from the AI service.");
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
      setError("Could not save the generated passage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      width="md"
      title="AI passage generator"
      subtitle="Turn a long text into a typing-friendly summary."
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate("/practice/select")}
        >
          Back to passages
        </Button>
      }
    >
      <Card className="mb-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" hint="Defaults to “AI Summary” if left blank.">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                placeholder="Optional title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}
          </Field>

          <Field label="AI service URL" hint="The ngrok host that exposes your summarizer.">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                placeholder="https://xxxx.ngrok-free.app"
                value={aiBaseUrl}
                onChange={(e) => setAiBaseUrl(e.target.value)}
              />
            )}
          </Field>

          <Field label="Language">
            {({ id }) => (
              <Input
                id={id}
                placeholder="english"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            )}
          </Field>

          <Field label="Difficulty">
            {({ id }) => (
              <Select
                id={id}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TypingTextDifficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            )}
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
          <Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Make this passage public
        </label>

        {/* Mode switch */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant={inputMode === "text" ? "primary" : "secondary"}
            icon={<FileText size={14} />}
            onClick={() => setInputMode("text")}
          >
            Paste text
          </Button>
          <Button
            size="sm"
            variant={inputMode === "file" ? "primary" : "secondary"}
            icon={<FileText size={14} />}
            onClick={() => setInputMode("file")}
          >
            Upload file
          </Button>
        </div>
      </Card>

      {inputMode === "file" ? (
        <Card className="mb-5">
          <Field
            label="Upload PDF or Word document"
            hint="Only the file name is recorded for now — summarising from files isn't wired up yet."
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file ? file.name : null);
                }}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-control file:border-0 file:bg-surface-sunken file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-border"
              />
            )}
          </Field>
          {fileName && <p className="mt-3 text-sm text-muted">Selected: {fileName}</p>}
        </Card>
      ) : (
        <Card className="mb-5">
          <Field label="Source text">
            {({ id }) => (
              <Textarea
                id={id}
                className="min-h-[180px]"
                placeholder="Paste the text you want summarised..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            )}
          </Field>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              icon={<Wand2 size={15} />}
              loading={summarizing}
              onClick={handleSummarize}
            >
              {summarizing ? "Summarizing..." : "Summarize"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setInputText("");
                setSummary("");
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <Field label="Summary" hint="You can edit the result before saving.">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              className="min-h-[160px]"
              placeholder="The summary will appear here..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          )}
        </Field>

        {error && (
          <Alert tone="danger" className="mt-3">
            {error}
          </Alert>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button icon={<Sparkles size={15} />} loading={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save to passage library"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/practice/select")}>
            Back to passages
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
