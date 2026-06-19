import React from "react";

export interface ThemeSwatchProps {
  /** Display label under the swatch. */
  label: string;
  /** Theme page background color. */
  background: string;
  /** Theme hero gradient (the band at the top of the swatch). */
  hero: string;
  /** Theme accent color (the dot). */
  accent: string;
  /** Whether this swatch is the selected theme. */
  selected?: boolean;
  onClick?: () => void;
}

/**
 * Theme preview swatch. A small card showing a theme's hero gradient band over
 * its background, with an accent dot and label. Selecting one highlights it with
 * an accent border + glow. Used in the site theme picker.
 */
export function ThemeSwatch({
  label,
  background,
  hero,
  accent,
  selected = false,
  onClick,
}: ThemeSwatchProps) {
  return (
    <div onClick={onClick} title={label} style={{ cursor: "pointer", width: 84 }}>
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          background,
          border: selected ? "2px solid var(--accent)" : "2px solid var(--border)",
          boxShadow: selected ? "var(--glow)" : "none",
          transition: "all 0.15s",
        }}
      >
        <div style={{ height: 34, background: hero }} />
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: accent,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 6,
          textAlign: "center",
          color: selected ? "var(--accent)" : "var(--muted)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
