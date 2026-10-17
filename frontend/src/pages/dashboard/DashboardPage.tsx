import { Link } from "react-router-dom";
import {
  BookOpen,
  CreditCard,
  History,
  Keyboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../app/providers/AuthProvider";

type Action = {
  title: string;
  description: string;
  to: string;
  cta: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const ACTIONS: Action[] = [
  {
    title: "Start a quiz",
    description: "Pick a subject and chapter, then tune your exam settings.",
    to: "/subjects",
    cta: "Browse subjects",
    icon: BookOpen,
  },
  {
    title: "Generate questions with AI",
    description: "Describe a topic or paste text and turn it into a question set.",
    to: "/ai/quiz",
    cta: "Generate questions",
    icon: Sparkles,
  },
  {
    title: "Typing practice",
    description: "Choose a passage and track your WPM and accuracy over time.",
    to: "/practice/select",
    cta: "Choose a passage",
    icon: Keyboard,
  },
  {
    title: "Quiz history",
    description: "Review past attempts and clear out the ones you no longer need.",
    to: "/attempts/history",
    cta: "View history",
    icon: History,
  },
  {
    title: "Flashcards",
    description: "Build decks and study them in flip mode.",
    to: "/flashcard-decks",
    cta: "Open flashcards",
    icon: CreditCard,
  },
  {
    title: "Admin area",
    description: "Manage subjects, chapters, questions, roles and accounts.",
    to: "/admin/subjects",
    cta: "Open admin",
    icon: ShieldCheck,
    adminOnly: true,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const isAdmin = Boolean(
    user?.role === "admin" ||
      user?.roles?.some((role) => role === "admin" || role === "superadmin")
  );

  const actions = ACTIONS.filter((action) => !action.adminOnly || isAdmin);

  return (
    <PageShell width="wide">
      <section className="mb-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col justify-center">
          <Badge tone="primary" icon={<Sparkles size={12} />} className="mb-3 self-start">
            Dashboard
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-2 max-w-prose text-muted">
            Jump back into quizzes, typing practice or flashcards. Everything is one click away.
          </p>
        </div>

        <Card className="flex flex-col justify-center bg-surface-inverse text-surface-inverse-foreground border-transparent">
          <h2 className="text-lg font-semibold">Your next move</h2>
          <p className="mt-1 text-sm opacity-80">
            Pick a path below and keep your momentum going.
          </p>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to} className="group">
              <Card interactive className="flex h-full flex-col">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-fg">
                  <Icon size={19} />
                </span>
                <h3 className="text-base font-semibold text-foreground">{action.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted">{action.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {action.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Card>
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}
