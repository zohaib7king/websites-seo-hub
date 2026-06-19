import React from "react";

export interface StatCardProps {
  /** Small label above the value (e.g. "Published Articles"). */
  label: string;
  /** The headline metric — number or short string. */
  value: React.ReactNode;
  /** Optional caption under the value. */
  sub?: string;
  /** Color of the value text. Defaults to `var(--accent)`. */
  color?: string;
  /** Gradient for the 3px top accent bar. Defaults to `var(--grad-accent)`. */
  grad?: string;
}

/**
 * Dashboard metric card. A raised `--grad-surface` panel with a thin gradient
 * accent bar across the top, a muted label, a large bold value, and an optional
 * sub-caption. Used in the dashboard stat grid.
 */
export function StatCard({
  label,
  value,
  sub,
  color = "var(--accent)",
  grad = "var(--grad-accent)",
}: StatCardProps) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--grad-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px 24px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: grad }} />
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
