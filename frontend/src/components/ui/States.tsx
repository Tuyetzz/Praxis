import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`h-5 w-5 animate-spin text-muted ${className}`} aria-hidden="true" />;
}

/** Centered loading placeholder for a whole page region. */
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

/** Centered empty-state with an optional action (e.g. "Create the first one"). */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border px-6 py-14 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Page-level error, used when a whole view fails to load. */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-card border border-danger/30 bg-danger-soft px-6 py-12 text-center"
    >
      <div>
        <p className="font-semibold text-danger">{title}</p>
        {description && <p className="mt-1 text-sm text-danger/90">{description}</p>}
      </div>
      {action}
    </div>
  );
}
