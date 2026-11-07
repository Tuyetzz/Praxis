import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getMyTypingResults, hardDeleteTypingResult } from "../../api/typingResults";
import type { TypingResult } from "../../types/typingResult";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { EmptyState, LoadingState } from "../../components/ui/States";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds < 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default function TypingHistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadResults() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyTypingResults();
        if (!active) return;
        setResults(data);
      } catch {
        if (active) setError("Could not load your typing history.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResults();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    if (results.length === 0) return { avgWpm: 0, avgAcc: 0 };
    const sumWpm = results.reduce((sum, item) => sum + (item.wpm || 0), 0);
    const sumAcc = results.reduce((sum, item) => sum + (item.accuracy || 0), 0);
    return {
      avgWpm: Math.round(sumWpm / results.length),
      avgAcc: Math.round(sumAcc / results.length),
    };
  }, [results]);

  async function handleDelete(resultId?: string) {
    if (!resultId) return;
    if (!window.confirm("Permanently delete this typing result?")) return;
    setDeletingId(resultId);
    try {
      await hardDeleteTypingResult(resultId);
      setResults((prev) => prev.filter((item) => item.id !== resultId));
    } catch {
      setError("Could not delete that typing result.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell
      title="Typing history"
      subtitle="Track your speed and accuracy over time."
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate("/practice/select")}
        >
          Passages
        </Button>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{totals.avgWpm}</p>
          <p className="text-xs text-muted">Average WPM</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-success">{totals.avgAcc}%</p>
          <p className="text-xs text-muted">Average accuracy</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-foreground">{results.length}</p>
          <p className="text-xs text-muted">Sessions</p>
        </Card>
      </div>

      {loading && <LoadingState label="Loading history..." />}

      {!loading && results.length === 0 && (
        <EmptyState
          title="No typing history yet"
          description="Finish a passage and your results will appear here."
          action={<Button onClick={() => navigate("/practice/select")}>Choose a passage</Button>}
        />
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-3">
          {results.map((item) => {
            const errorTags = item.errorTags ? Object.entries(item.errorTags) : [];
            return (
              <Card key={item.id || `${item.textId}-${item.createdAt}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{item.wpm} WPM</Badge>
                    <Badge tone="success">{item.accuracy}% accuracy</Badge>
                  </div>
                  <div className="text-right text-sm text-muted">
                    <p>{formatDate(item.createdAt)}</p>
                    <p>Duration: {formatDuration(item.durationSeconds)}</p>
                  </div>
                </div>

                <div className="mt-3 border-t border-border pt-3 text-sm">
                  {errorTags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-muted">Missed keys:</span>
                      {errorTags.map(([key, count]) => (
                        <Badge key={key} tone="warning">
                          {key === " " ? "space" : key} × {count}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">No missed keys recorded.</span>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={14} />}
                    loading={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
