import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

const SIZES = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Only close when the backdrop itself is clicked, not a child.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`scrollbar-slim w-full ${SIZES[size]} max-h-[90vh] overflow-y-auto rounded-card border border-border bg-surface-raised shadow-pop focus:outline-none`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X size={16} />
            </Button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
