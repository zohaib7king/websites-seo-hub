import React from "react";

export type BadgeTone = "success" | "muted" | "warning" | "danger" | "accent";

export interface BadgeProps {
  /** Color tone. `success` (active/published), `muted` (inactive/draft-neutral), `warning`, `danger`, `accent`. */
  tone?: BadgeTone;
  /** Badge label. */
  children: React.ReactNode;
}

const TONES: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: "rgba(34,197,94,0.15)", color: "var(--success)" },
  muted: { bg: "rgba(100,116,139,0.15)", color: "var(--muted)" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "var(--warning)" },
  danger: { bg: "rgba(239,68,68,0.15)", color: "var(--danger)" },
  accent: { bg: "rgba(99,102,241,0.15)", color: "var(--accent)" },
};

/**
 * Status pill. A small rounded badge with a translucent tinted fill and matching
 * text color — used for site/article status (active, draft) and other states.
 */
export function Badge({ tone = "muted", children }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: t.bg,
        color: t.color,
      }}
    >
      {children}
    </span>
  );
}
