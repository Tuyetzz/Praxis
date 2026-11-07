import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { getSubjects } from "../../../api/subjects";
import type { Subject } from "../../../types/subject";
import PageShell from "../../../components/PageShell";
import Card from "../../../components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "../../../components/ui/States";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch((err) => {
        console.error("Failed to load subjects:", err);
        setError("Could not load subjects. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="Subjects"
      subtitle="Pick a subject to see its chapters and start an attempt."
    >
      {loading && <LoadingState label="Loading subjects..." />}

      {!loading && error && <ErrorState description={error} />}

      {!loading && !error && subjects.length === 0 && (
        <EmptyState
          icon={<BookOpen size={26} />}
          title="No subjects yet"
          description="Once subjects are added they'll show up here."
        />
      )}

      {!loading && !error && subjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              as="button"
              interactive
              className="flex flex-col"
              onClick={() => navigate(`/subjects/${subject.id}/chapters`)}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-soft text-primary">
                  <BookOpen size={17} />
                </span>
                <ChevronRight size={16} className="mt-2 text-muted" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{subject.name}</h3>
              <p className="mt-1 text-sm text-muted">{subject.slug ?? "View chapters"}</p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
