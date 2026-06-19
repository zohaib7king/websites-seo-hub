# @zoyzoy/ui

The ZoyZoy Hub design system, packaged as a buildable React component library.
Components are extracted from the CRM (`crm/src/`) and styled with the shared
CSS-variable token system (see `docs/design-system.md` at the repo root).

## Usage

```jsx
import "@zoyzoy/ui/tokens.css"; // once, at your app root — defines the design tokens
import { Button, StatCard, Badge } from "@zoyzoy/ui";

<Button variant="primary">Add Site</Button>
<Badge tone="success">active</Badge>
<StatCard label="Revenue (30d)" value="$1,240.00" grad="var(--grad-success)" />
```

## Components

| Component     | Purpose                                              |
|---------------|------------------------------------------------------|
| `Button`      | Primary / secondary / outline action button         |
| `Badge`       | Status pill (success, muted, warning, danger, accent)|
| `Card`        | Surface panel (flat / gradient / emphasized)         |
| `StatCard`    | Dashboard metric card with gradient accent bar       |
| `Input`       | Text input with accent focus ring                    |
| `Field`       | Labeled form field wrapper                           |
| `NavItem`     | Sidebar navigation item (active gradient state)      |
| `CodeBlock`   | Monospace command / code block                       |
| `ThemeSwatch` | Theme preview swatch for the site theme picker       |
| `ArticleCard` | Public-site article card                             |

## Build

```bash
npm install
npm run build   # → dist/index.js (ESM) + dist/index.d.ts
```

Styling lives in `src/tokens.css` (the design tokens) — components reference the
variables inline. `--accent`, `--surface`, the `--grad-*` gradients, and `--glow`
are the core vocabulary; see `docs/design-system.md` for the full reference.
