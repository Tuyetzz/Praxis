import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

/**
 * Thin wrappers over <table> so admin tables share one look in both themes.
 * Usage:
 *   <Table><thead><Tr><Th>Name</Th></Tr></thead><tbody>...</tbody></Table>
 */
export function Table({ className = "", children }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="scrollbar-slim w-full overflow-x-auto rounded-card border border-border">
      <table className={`w-full border-collapse text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function Th({ className = "", children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`whitespace-nowrap bg-surface-sunken px-4 py-3 text-left font-semibold text-foreground ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ className = "", children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`border-t border-border px-4 py-3 align-top text-muted ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

export function Tr({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLTableRowElement> & { children: ReactNode }) {
  return (
    <tr className={`transition-colors duration-100 hover:bg-surface-sunken/60 ${className}`} {...rest}>
      {children}
    </tr>
  );
}
