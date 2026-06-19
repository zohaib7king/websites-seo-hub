import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Visual style. `primary` is the gradient CTA, `secondary` is a neutral fill, `outline` is a bordered ghost. */
  variant?: ButtonVariant;
  /** `md` is the default action size; `sm` is the compact inline size (e.g. card actions). */
  size?: ButtonSize;
  /** Button label / content. */
  children?: React.ReactNode;
}

const PAD: Record<ButtonSize, string> = {
  md: "10px 20px",
  sm: "5px 12px",
};

const FONT_SIZE: Record<ButtonSize, number> = { md: 13, sm: 11 };

/**
 * Primary action button. The gradient `primary` variant is the main call to
 * action (used for "Add Site", "Create", "Generate"); `secondary` is the
 * neutral companion (Cancel); `outline` is a bordered ghost for inline actions.
 */
export function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  className,
  ...rest
}: ButtonProps) {
  const base: React.CSSProperties = {
    border: "none",
    borderRadius: "var(--radius)",
    padding: PAD[size],
    fontWeight: 600,
    fontSize: FONT_SIZE[size],
  };

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: "var(--grad-accent)",
      color: "white",
      boxShadow: "var(--glow)",
    },
    secondary: {
      background: "var(--border)",
      color: "var(--text)",
    },
    outline: {
      background: "var(--border)",
      color: "var(--text)",
      border: "1px solid var(--accent)",
    },
  };

  return (
    <button
      className={["zz-btn", className].filter(Boolean).join(" ")}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
