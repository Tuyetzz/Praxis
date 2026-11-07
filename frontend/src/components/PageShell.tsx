import type { ReactNode } from "react";
import AppHeader from "./AppHeader";

type PageShellProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Max content width. `wide` for admin/table views, `md` for forms/reading. */
  width?: "sm" | "md" | "lg" | "wide";
  /** Render a centered card instead of a left-aligned page (used by auth pages). */
  centered?: boolean;
  children: ReactNode;
};

const WIDTHS = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  wide: "max-w-7xl",
};

/**
 * Standard page frame: theme-aware backdrop + app header + consistent
 * max-width/padding. Replaces the minHeight/gradient/fontFamily wrapper that
 * every page used to hand-roll.
 */
export default function PageShell({
  title,
  subtitle,
  actions,
  width = "lg",
  centered = false,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-surface bg-page">
      <AppHeader />

      {centered ? (
        <main className={`mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10`}>
          <div className="w-full max-w-md">{children}</div>
        </main>
      ) : (
        <main className={`mx-auto ${WIDTHS[width]} px-4 pb-16 pt-8 sm:px-6`}>
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="mt-1.5 text-sm text-muted sm:text-base">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      )}
    </div>
  );
}
