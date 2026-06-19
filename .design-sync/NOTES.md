# design-sync notes — @zoyzoy/ui

Repo-specific gotchas for future syncs. Read before re-running.

## Where the DS lives
- The design system is a **new package, `packages/ui`**, created for this sync. Its
  components were **extracted from the existing inline-styled code** in `crm/src/` (pages
  + module-scope sub-components) and `sites/*/src/` (ArticleCard, ThemeSwatch). The
  human-readable reference is `docs/design-system.md` at the repo root.
- Tokens live in `packages/ui/src/tokens.css` (`cfg.cssEntry`) — the same CSS variables as
  `crm/src/index.css`. Components use inline styles referencing `var(--*)`.

## Build / converter invocation (run from repo ROOT)
- Build: `npm --prefix packages/ui run build` (`cfg.buildCmd`) → tsup emits
  `packages/ui/dist/index.js` (ESM) + `packages/ui/dist/index.d.ts`.
- Converter entry + node_modules are NOT repo-root defaults — pass explicitly:
  `--entry ./packages/ui/dist/index.js --node-modules packages/ui/node_modules`.
- Converter deps (esbuild, ts-morph, @types/react, playwright) are installed in `.ds-sync/`
  (gitignored). `typescript` is NOT installed there, so validate skips the `.d.ts` parse check
  (non-blocking; tsup already type-checked at build).

## Known render warns (triaged — not new on re-sync)
- `[FONT_REMOTE] "Inter"` — `tokens.css` `@import`s Inter from the Google Fonts CDN so the brand
  font actually renders. Intentional, loads at runtime, no action. (The original repo only
  declared `'Inter', sans-serif` with no @font-face and relied on system fallback; the remote
  import is a faithful improvement, not a substitute.)

## Preview overrides (intentional)
- `cardMode: "column"` on ArticleCard, Card, CodeBlock, Field, Input, StatCard — their preview
  layouts are wider than a grid cell, so column mode (one story per row, full width) avoids the
  product cropping them. These are presentation-only and won't re-flag.

## Re-sync risks (watch-list)
- **ArticleCard `WithImage`** preview uses a remote Unsplash image URL. If that URL rots the card
  shows a broken image — the `Placeholder` cell (gradient fallback) is self-contained and safe.
- **Inter font** is fetched from the Google Fonts CDN at render time (see Known render warns).
- Components are styled for a **dark-first** surface; previews that show loose text
  (Badge `InContext`, NavItem `States`) wrap their content in a dark panel so it reads on the
  white capture background. Keep that wrapper if editing those previews.
- If the CRM/sites change a token or component pattern, update `packages/ui` to match — this
  package is a separate copy, not auto-derived. Same drift discipline as `docs/design-system.md`.
