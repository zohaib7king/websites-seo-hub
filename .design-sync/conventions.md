# ZoyZoy Hub UI — how to build with it

A **dark-first** React design system. Components are styled with inline styles that
reference a set of CSS custom properties (design tokens). There are **no utility
classes and no className API** — you style your own layout glue with the same `var(--*)`
tokens the components use.

## Setup (required)

Import the token stylesheet **once at the app root**. It defines every `var(--*)` token
and sets the dark page background. Without it, components render with the right structure
but no colors (tokens resolve to nothing).

```jsx
import "@zoyzoy/ui/tokens.css";
import { Button, StatCard, Badge } from "@zoyzoy/ui";
```

There is **no provider/theme wrapper** — the tokens are global CSS variables, so any
component works as soon as `tokens.css` is loaded. The intended surface is dark
(`--bg` is near-black); place components on `--bg` / `--surface`, not on white.

## Styling idiom

- **Style components through their props, not classes.** Variants carry the design
  language: `<Button variant="primary">`, `<Badge tone="success">`, `<Card gradient emphasized>`,
  `<StatCard grad="var(--grad-success)">`. There is no `className` styling contract.
- **For your own layout glue (wrappers, grids, spacing), use the tokens inline** via
  `var(--*)`. Never hard-code hex colors — reach for a token.

### Token vocabulary (defined in `tokens.css`)

| Group      | Tokens |
|------------|--------|
| Surfaces   | `--bg` (page), `--surface` (cards/panels), `--border` |
| Text       | `--text` (primary), `--muted` (secondary/labels) |
| Accents    | `--accent` (indigo, primary), `--accent2` (cyan) |
| Status     | `--success`, `--warning`, `--danger` |
| Gradients  | `--grad-accent`, `--grad-primary`, `--grad-success`, `--grad-danger`, `--grad-surface` |
| Other      | `--radius` (10px), `--glow` (CTA/elevation shadow), `--font` (Inter) |

## Where the truth lives

- The full token set and base styles: **`tokens.css`** (the file you import) and the
  bundle's `styles.css` import closure.
- Per-component API + usage: each component's **`<Name>.d.ts`** (props) and
  **`<Name>.prompt.md`** (examples) in this project.

## Idiomatic example

A dashboard strip — library components for the controls, tokens for the layout glue:

```jsx
import "@zoyzoy/ui/tokens.css";
import { StatCard, Button, Badge } from "@zoyzoy/ui";

<div style={{ background: "var(--bg)", padding: 32 }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
    <h1 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
    <Button variant="primary">+ Add Site</Button>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
    <StatCard label="Total Sites" value={4} sub="Active websites" />
    <StatCard label="Published" value={28} color="var(--success)" grad="var(--grad-success)" />
    <StatCard label="Drafts" value={6} color="var(--warning)" grad="var(--grad-danger)" />
    <StatCard label="Revenue (30d)" value="$1,240" color="var(--accent2)" />
  </div>
  <div style={{ marginTop: 16 }}><Badge tone="success">active</Badge></div>
</div>
```

Components available: `Button`, `Badge`, `Card`, `StatCard`, `Input`, `Field`, `NavItem`,
`CodeBlock`, `ThemeSwatch`, `ArticleCard`.
