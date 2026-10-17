import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      setErr("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell centered>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-card bg-primary text-primary-fg shadow-lift">
          <GraduationCap size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to continue practicing.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Email">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
          </Field>

          <Field label="Password">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
          </Field>

          {err && <Alert tone="danger">{err}</Alert>}

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </PageShell>
  );
}
