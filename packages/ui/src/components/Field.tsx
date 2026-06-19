import React from "react";

export interface FieldProps {
  /** Field label, rendered as a small uppercase-style muted caption above the control. */
  label: string;
  /** The control — typically an `<Input>` or `<select>`. */
  children: React.ReactNode;
  /** Bottom margin in px between stacked fields. Defaults to 14. */
  gap?: number;
}

/**
 * Labeled form field. Wraps a control (Input, select) with a small muted label
 * above it and consistent vertical spacing. Used throughout the CRM forms.
 */
export function Field({ label, children, gap = 14 }: FieldProps) {
  return (
    <div style={{ marginBottom: gap }}>
      <label style={{ display: "block", color: "var(--muted)", fontSize: 11, marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
