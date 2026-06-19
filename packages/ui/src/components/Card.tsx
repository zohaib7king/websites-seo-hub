import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, uses the `--grad-surface` panel background instead of flat `--surface`. */
  gradient?: boolean;
  /** When true, emphasizes the card with an accent border + glow (e.g. an open form panel). */
  emphasized?: boolean;
  /** Inner padding in px. Defaults to 20. */
  padding?: number;
  children?: React.ReactNode;
}

/**
 * Surface container for content. The base card is a flat `--surface` panel with
 * a subtle border and rounded corners; `gradient` and `emphasized` raise it for
 * forms and highlighted regions.
 */
export function Card({
  gradient = false,
  emphasized = false,
  padding = 20,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      style={{
        background: gradient ? "var(--grad-surface)" : "var(--surface)",
        border: emphasized ? "1px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding,
        boxShadow: emphasized ? "var(--glow)" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
