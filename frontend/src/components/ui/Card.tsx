import type { ElementType, HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  interactive?: boolean;
  padded?: boolean;
  children: ReactNode;
};

export default function Card({
  as: Tag = "div",
  interactive = false,
  padded = true,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={[
        "rounded-card border border-border bg-surface-raised shadow-card",
        padded ? "p-5" : "",
        interactive
          ? "cursor-pointer text-left transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
