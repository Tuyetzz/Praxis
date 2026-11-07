import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";

const CONTROL_BASE =
  "w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted/70 transition-colors duration-150 " +
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Label({
  className = "",
  children,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium text-foreground ${className}`} {...rest}>
      {children}
    </label>
  );
}

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: (props: { id: string; describedBy?: string }) => ReactNode;
};

/**
 * Wraps a control with a label + hint/error, wiring up htmlFor and
 * aria-describedby so the a11y attributes can't be forgotten at call sites.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      {children({ id, describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL_BASE} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${CONTROL_BASE} pr-8 ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${CONTROL_BASE} scrollbar-slim ${className}`} {...rest} />;
}

// Checkbox / radio share the accent color so they follow the theme too.
export function Checkbox({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary ${className}`}
      {...rest}
    />
  );
}

export function Radio({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="radio"
      className={`h-4 w-4 shrink-0 cursor-pointer border-border accent-primary ${className}`}
      {...rest}
    />
  );
}
