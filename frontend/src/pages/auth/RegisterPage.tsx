import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { register as apiRegister } from "../../api/auth";
import { useAuth } from "../../app/providers/AuthProvider";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      await apiRegister({ name, email, password });
      setOk("Account created. Redirecting you to sign in...");
      setTimeout(() => navigate("/login"), 900);
    } catch {
      setErr("Registration failed. That email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell centered>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-card bg-primary text-primary-fg shadow-lift">
          <UserPlus size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Start practicing in under a minute.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Full name">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
          </Field>

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
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
          </Field>

          {err && <Alert tone="danger">{err}</Alert>}
          {ok && <Alert tone="success">{ok}</Alert>}

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </PageShell>
  );
}
