# CRM (React + Vite) guardrails

- **Never define a component inside another component's render.** Doing so gives it a new
  identity every keystroke, remounting inputs and stealing focus (the "can't type in the form"
  bug). Define sub-components at module scope and pass props.
- Inline styles only, using the CSS variables / gradient tokens in `crm/src/index.css`
  (`--accent`, `--grad-accent`, `--glow`, …). No external UI libs, no Tailwind.
- Keep all fetch calls in `crm/src/api/client.js` — never `fetch()` directly in components.
- No `localStorage` / `sessionStorage`. No `<form>` tags — use `onClick`/`onChange`.
- When shipping CRM changes, bump the version badge in `App.jsx` so a stale browser cache is
  obvious (hard-refresh confirms the new build loaded).
