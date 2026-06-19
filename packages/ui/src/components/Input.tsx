import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Text input. Dark `--bg` fill, subtle border, rounded corners, and a global
 * accent focus ring (border + glow). Style matches selects in the same forms.
 */
export function Input({ style, className, ...rest }: InputProps) {
  return (
    <input
      className={["zz-input", className].filter(Boolean).join(" ")}
      style={{
        width: "100%",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "9px 12px",
        color: "var(--text)",
        fontSize: 13,
        ...style,
      }}
      {...rest}
    />
  );
}
