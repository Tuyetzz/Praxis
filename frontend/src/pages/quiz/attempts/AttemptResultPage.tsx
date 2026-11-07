import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Trash2, XCircle } from "lucide-react";
import {
  getAttemptGrade,
  hardDeleteAttempt,
  type AttemptGradeResponse,
} from "../../../api/attempts";
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/States";

const STATUS_TONE = {
  correct: "success",
  wrong: "danger",
  blank: "neutral",
} as const;

export default function AttemptResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attemptId = id || "";

  const [result, setResult] = useState<AttemptGradeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadResult() {
      if (!attemptId) {
        setError("Missing attempt id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getAttemptGrade(attemptId);
        if (!active) return;
        setResult(data);
      } catch (e: unknown) {
        const message =
          typeof e === "object" &&
          e &&
          "response" in e &&
          typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message ===
            "string"
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : "Could not load your result.";
        if (active) setError(message || "Could not load your result.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResult();
    return () => {
      active = false;
    };
  }, [attemptId]);

  async function handleDeleteAttempt() {
    if (!attemptId) return;
    if (!window.confirm("Permanently delete this attempt? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await hardDeleteAttempt(attemptId);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Could not delete this attempt.");
      setDeleting(false);
    }
  }

  function formatAnswer(answer: AttemptGradeResponse["detailedAnswers"][number]["selectedAnswer"]) {
    if (!answer) return "—";
    if (typeof answer === "string") return answer;
    if (Array.isArray(answer)) {
      return answer.map((item) => item.text || item.id).join(", ") || "—";
    }
    return "—";
  }

  if (loading) {
    return (
      <PageShell width="md">
        <LoadingState label="Loading result..." />
      </PageShell>
    );
  }

  return (
    <PageShell
      width="md"
      title="Attempt result"
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate("/attempts/history")}
        >
          History
        </Button>
      }
    >
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {result && (
        <>
          <Card className="mb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Score</p>
                <p className="text-3xl font-bold text-foreground">
                  {result.summary.totalEarnedPoints}
                  <span className="text-lg font-medium text-muted"> / {result.summary.maxScore}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Accuracy</p>
                <p className="text-3xl font-bold text-foreground">
                  {result.summary.accuracyPercentage}%
                </p>
              </div>
              <Badge tone={result.summary.isPassed ? "success" : "warning"}>
                {result.summary.isPassed ? "Passed" : "Not passed"}
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Stat label="Correct" value={result.summary.correctCount} tone="text-success" />
              <Stat label="Wrong" value={result.summary.wrongCount} tone="text-danger" />
              <Stat label="Blank" value={result.summary.blankCount} tone="text-muted" />
            </div>
          </Card>

          <h2 className="mb-3 text-lg font-semibold text-foreground">Answer breakdown</h2>

          <div className="grid gap-3">
            {result.detailedAnswers.map((item, index) => (
              <Card key={item.questionId}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">
                    <span className="mr-2 text-muted">{index + 1}.</span>
                    {item.questionText}
                  </p>
                  <Badge
                    tone={STATUS_TONE[item.status as keyof typeof STATUS_TONE] ?? "neutral"}
                    icon={
                      item.status === "correct" ? (
                        <CheckCircle2 size={12} />
                      ) : item.status === "wrong" ? (
                        <XCircle size={12} />
                      ) : undefined
                    }
                  >
                    {item.status}
                  </Badge>
                </div>

                <dl className="mt-3 grid gap-1.5 text-sm">
                  <Row label="Your answer" value={formatAnswer(item.selectedAnswer)} />
                  <Row label="Correct answer" value={formatAnswer(item.correctAnswer)} />
                  <Row label="Points" value={`${item.points} / ${item.maxPoints}`} />
                </dl>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
        <Button
          variant="danger"
          icon={<Trash2 size={15} />}
          loading={deleting}
          onClick={handleDeleteAttempt}
        >
          Delete attempt
        </Button>
      </div>
    </PageShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-muted">{label}:</dt>
      <dd className="min-w-0 break-words text-foreground">{value}</dd>
    </div>
  );
}
