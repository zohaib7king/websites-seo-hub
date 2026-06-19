import React from "react";

export interface CodeBlockProps {
  /** The command or code to display, monospaced. */
  children: React.ReactNode;
}

/**
 * Inline command / code block. Black background with cyan monospace text —
 * used to surface shell commands (e.g. the rebuild command after provisioning).
 */
export function CodeBlock({ children }: CodeBlockProps) {
  return (
    <div
      style={{
        padding: "8px 10px",
        background: "#000",
        color: "var(--accent2)",
        borderRadius: 6,
        fontFamily: "monospace",
        fontSize: 12,
      }}
    >
      {children}
    </div>
  );
}
