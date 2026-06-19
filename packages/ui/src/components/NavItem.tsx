import React from "react";

export interface NavItemProps {
  /** Leading glyph/icon (emoji or node). */
  icon?: React.ReactNode;
  /** Item label. */
  label: string;
  /** Whether this item is the current route — switches to the gradient active state. */
  active?: boolean;
  /** Click handler (navigation is the host app's concern). */
  onClick?: () => void;
}

/**
 * Sidebar navigation item. Inactive items are muted and transparent; the active
 * item fills with the accent gradient, turns white, and lifts with a glow.
 */
export function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: "var(--radius)",
        color: active ? "#fff" : "var(--muted)",
        background: active ? "var(--grad-accent)" : "transparent",
        boxShadow: active ? "var(--glow)" : "none",
        fontWeight: active ? 600 : 400,
        marginBottom: 2,
        transition: "all 0.15s",
        cursor: "pointer",
      }}
    >
      {icon != null && <span>{icon}</span>} {label}
    </div>
  );
}
