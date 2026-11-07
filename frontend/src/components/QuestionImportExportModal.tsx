import { useEffect, useState } from "react";
import { importQuestionsFromFile } from "../api/questions";

type ImportResult = {
  totalQuestions?: number;
  importedQuestions?: number;
  failedQuestions?: number;
};

type QuestionImportExportModalProps = {
  isOpen: boolean;
  subjectId: string | null;
  chapterId: string | null;
  onClose: () => void;
  onImported?: () => void | Promise<void>;
};

export default function QuestionImportExportModal({
  isOpen,
  subjectId,
  chapterId,
  onClose,
  onImported,
}: QuestionImportExportModalProps) {
  const [fileType, setFileType] = useState<"kahoot" | "quizizz">("kahoot");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setError(null);
    setResult(null);
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImport = async () => {
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    if (!subjectId || !chapterId) {
      setError("Subject and chapter must be selected before importing.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await importQuestionsFromFile({
        file,
        subjectId,
        chapterId,
        fileType,
      });
      setResult({
        totalQuestions: data?.totalQuestions,
        importedQuestions: data?.importedQuestions,
        failedQuestions: data?.failedQuestions,
      });
      if (onImported) {
        await onImported();
      }
    } catch (err) {
      const apiMessage =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const message = apiMessage || (err instanceof Error ? err.message : "Import failed.");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <h2 style={{ marginTop: 0 }}>Import / Export</h2>
        <p style={{ color: "#64748b", marginTop: 0 }}>
          Use a Kahoot or Quizizz template to prepare your data.
        </p>

        {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}
        {result && (
          <div className="admin-panel" style={{ color: "#0f766e" }}>
            Imported {result.importedQuestions ?? 0}/{result.totalQuestions ?? 0} questions.
            {typeof result.failedQuestions === "number" && result.failedQuestions > 0
              ? ` Failed: ${result.failedQuestions}.`
              : ""}
          </div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Import spreadsheet</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <select
                className="admin-input"
                value={fileType}
                onChange={(event) => setFileType(event.target.value as "kahoot" | "quizizz")}
              >
                <option value="quizizz">Quizizz format</option>
                <option value="kahoot">Kahoot format (not working yet)</option>
              </select>
              <input
                className="admin-input"
                type="file"
                accept=".xlsx,.xls,.csv,.json"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button
                className="admin-button admin-button--primary"
                onClick={handleImport}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Importing..." : "Import"}
              </button>
            </div>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Export / templates</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                className="admin-button admin-button--muted"
                href="/Kahoot!%20Quiz%20Import%20Template.xlsx"
                download
              >
                Download Kahoot template
              </a>
              <a
                className="admin-button admin-button--muted"
                href="/QuizizzSampleSpreadsheetUpdated_v2.xlsx"
                download
              >
                Download Quizizz template
              </a>
              <button className="admin-button admin-button--primary" disabled>
                Export data (coming soon)
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={onClose}
            className="admin-button admin-button--muted"
            style={{ flex: 1 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
