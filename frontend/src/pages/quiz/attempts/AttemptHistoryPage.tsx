import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, History, Trash2 } from "lucide-react";
import { getMyAttempts, hardDeleteAttempt } from "../../../api/attempts";
import type { Attempt } from "../../../types/attempt";
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { EmptyState, LoadingState } from "../../../components/ui/States";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatScore(score: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) return "—";
  return `${score} / ${maxScore}`;
}

const STATUS_TONE = {
  in_progress: "primary",
  graded: "success",
  submitted: "success",
  expired: "warning",
  draft: "neutral",
} as const;

export default function AttemptHistoryPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [submittedTotal, setSubmittedTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const limit = 10;

  useEffect(() => {
    let active = true;

    async function loadAttempts(pageNumber: number) {
      setLoading(true);
      setError(null);
      try {
        const [pageRes, submittedRes, gradedRes] = await Promise.all([
          getMyAttempts({ page: pageNumber, limit }),
          getMyAttempts({ page: 1, limit: 1, status: "submitted" }),
          getMyAttempts({ page: 1, limit: 1, status: "graded" }),
        ]);
        if (!active) return;

        const nextAttempts = pageRes.data || [];

        // Stepped off the end (e.g. after deleting the last item on the page).
        if (nextAttempts.length === 0 && pageNumber > 1) {
          setPage(pageNumber - 1);
          return;
        }

        setAttempts(nextAttempts);
        setTotalItems(pageRes.totalItems || 0);
        setTotalPages(pageRes.totalPages || 1);
        setSubmittedTotal((submittedRes.totalItems || 0) + (gradedRes.totalItems || 0));
      } catch {
        if (active) setError("Could not load your attempt history.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAttempts(page);
    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  async function handleDelete(attemptId: string) {
    if (!window.confirm("Permanently delete this attempt? This cannot be undone.")) return;
    try {
      await hardDeleteAttempt(attemptId);
      setError(null);
      setReloadKey((prev) => prev + 1);
    } catch {
      setError("Could not delete this attempt.");
    }
  }

  return (
    <PageShell
      title="Quiz history"
      subtitle="Review your past attempts and clean up old ones."
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-sm">
        <Card className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalItems}</p>
          <p className="text-xs text-muted">Total attempts</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-foreground">{submittedTotal}</p>
          <p className="text-xs text-muted">Submitted</p>
        </Card>
      </div>

      {loading && <LoadingState label="Loading history..." />}

      {!loading && attempts.length === 0 && (
        <EmptyState
          icon={<History size={26} />}
          title="No attempts yet"
          description="Start a quiz and your results will show up here."
          action={<Button onClick={() => navigate("/subjects")}>Browse subjects</Button>}
        />
      )}

      {!loading && attempts.length > 0 && (
        <>
          <div className="grid gap-3">
            {attempts.map((attempt) => (
              <Card key={attempt.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground" title={attempt.id}>
                      Attempt #{attempt.id.slice(0, 8)}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">Mode: {attempt.mode}</p>
                  </div>
                  <Badge tone={STATUS_TONE[attempt.status as keyof typeof STATUS_TONE] ?? "neutral"}>
                    {attempt.status}
                  </Badge>
                </div>

                <dl className="mt-3 grid gap-1 border-t border-border pt-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted">Started</dt>
                    <dd className="text-foreground">{formatDate(attempt.startedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Submitted</dt>
                    <dd className="text-foreground">{formatDate(attempt.submittedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Score</dt>
                    <dd className="text-foreground">{formatScore(attempt.score, attempt.maxScore)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate(
                        attempt.status === "submitted" || attempt.status === "graded"
                          ? `/attempts/${attempt.id}/result`
                          : `/attempts/${attempt.id}`
                      )
                    }
                  >
                    View details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDelete(attempt.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-muted">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ChevronLeft size={15} />}
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
