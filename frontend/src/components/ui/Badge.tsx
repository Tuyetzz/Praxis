import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-muted border-border",
  primary: "bg-primary-soft text-primary border-primary/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
};

type BadgeProps = {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Badge({ tone = "neutral", icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
