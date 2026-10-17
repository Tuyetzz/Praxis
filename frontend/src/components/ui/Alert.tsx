import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONES: Record<AlertTone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: "border-primary/30 bg-primary-soft text-primary",
    icon: <Info size={16} />,
  },
  success: {
    wrap: "border-success/30 bg-success-soft text-success",
    icon: <CheckCircle2 size={16} />,
  },
  warning: {
    wrap: "border-warning/30 bg-warning-soft text-warning",
    icon: <AlertTriangle size={16} />,
  },
  danger: {
    wrap: "border-danger/30 bg-danger-soft text-danger",
    icon: <AlertCircle size={16} />,
  },
};

type AlertProps = {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Alert({ tone = "info", title, children, className = "" }: AlertProps) {
  const { wrap, icon } = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-control border px-3.5 py-2.5 text-sm ${wrap} ${className}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : "opacity-90"}>{children}</div>}
      </div>
    </div>
  );
}
