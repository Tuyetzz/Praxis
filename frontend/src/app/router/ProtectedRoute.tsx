import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { LoadingState } from "../../components/ui/States";
import PageShell from "../../components/PageShell";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <PageShell centered>
        <LoadingState label="Checking your session..." />
      </PageShell>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
