import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";
import { getChaptersBySubject } from "../../../api/chapters";
import type { Chapter } from "../../../types/chapter";
import { getSubjectById } from "../../../api/subjects";
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "../../../components/ui/States";

export default function ChaptersPage() {
  const { id } = useParams(); // subjectId
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getChaptersBySubject(id)
      .then(setChapters)
      .catch((err) => {
        console.error("Failed to load chapters:", err);
        setError("Could not load chapters for this subject.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getSubjectById(id)
      .then((s) => setSubjectName(s.name))
      .catch((err) => console.error("Failed to load subject:", err));
  }, [id]);

  return (
    <PageShell
      title="Chapters"
      subtitle={subjectName ? `Subject: ${subjectName}` : undefined}
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate("/subjects")}
        >
          All subjects
        </Button>
      }
    >
      {loading && <LoadingState label="Loading chapters..." />}

      {!loading && error && <ErrorState description={error} />}

      {!loading && !error && chapters.length === 0 && (
        <EmptyState
          icon={<Layers size={26} />}
          title="No chapters yet"
          description="This subject doesn't have any chapters to practice."
        />
      )}

      {!loading && !error && chapters.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <Card
              key={chapter.id}
              as="button"
              interactive
              className="flex flex-col"
              onClick={() => navigate(`/subjects/${id}/chapters/${chapter.id}/config`)}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-soft text-primary">
                  <Layers size={17} />
                </span>
                <ChevronRight size={16} className="mt-2 text-muted" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{chapter.name}</h3>
              <p className="mt-1 text-sm text-muted">Configure and start an attempt</p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
