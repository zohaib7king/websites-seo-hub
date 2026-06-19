# ZoyZoy Hub — Design System

Extracted from the codebase (not a redesign). This documents the design language **as it
actually exists today** so it can be reused consistently. Values are pulled from:

- `crm/src/index.css` — CRM tokens (single fixed dark theme + gradients)
- `crm/src/themes.js` — theme swatch preview data (CRM picker)
- `sites/<id>/src/themes.js` — the 6 public-site theme presets
- The inline-styled components across `crm/src/**` and `sites/<id>/src/**`

> **Two surfaces, two token sources.** The **CRM** uses one fixed dark theme (the `:root`
> variables in `crm/src/index.css`). The **public sites** are recolored per-site by one of 6
> **theme presets** injected as CSS variables in each site's `Layout.jsx`. The variable *names*
> are shared (`--bg`, `--surface`, `--accent`, …); the *values* differ by surface/theme.
> Styling is **inline styles referencing CSS variables** — no Tailwind, no UI library.

---

## 1. Color

### 1.1 CRM tokens (`crm/src/index.css` `:root`)

| Token        | Value     | Role                                  |
|--------------|-----------|---------------------------------------|
| `--bg`       | `#0d0f14` | Page background                       |
| `--surface`  | `#161922` | Cards, panels                         |
| `--border`   | `#242836` | Borders, dividers                     |
| `--accent`   | `#6366f1` | Primary (indigo) — links, active nav  |
| `--accent2`  | `#22d3ee` | Cyan highlight                        |
| `--text`     | `#e2e8f0` | Primary text                          |
| `--muted`    | `#64748b` | Secondary / label text                |
| `--success`  | `#22c55e` | Success / active status               |
| `--warning`  | `#f59e0b` | Warning / drafts                      |
| `--danger`   | `#ef4444` | Error / destructive                   |

**Gradient tokens** (referenced inline, e.g. `background: "var(--grad-accent)"`):

| Token            | Value                                                          | Used on                          |
|------------------|---------------------------------------------------------------|----------------------------------|
| `--grad-accent`  | `linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)`           | Primary buttons, active nav, logo|
| `--grad-primary` | `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)` | (3-stop variant)              |
| `--grad-danger`  | `linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)`           | Drafts stat card                 |
| `--grad-success` | `linear-gradient(135deg, #22c55e 0%, #22d3ee 100%)`           | Published stat card              |
| `--grad-surface` | `linear-gradient(160deg, #1a1e2a 0%, #14171f 100%)`           | Sidebar, stat/form panels        |
| `--glow`         | `0 6px 24px rgba(99, 102, 241, 0.28)`                         | Elevation glow on primary CTAs   |

**Ambient page background** (`body` in `index.css`): two radial indigo/cyan glows layered over
`--bg`, `background-attachment: fixed`:
```css
radial-gradient(1200px 600px at 100% -10%, rgba(99,102,241,0.13), transparent 60%),
radial-gradient(1000px 520px at -10% 110%, rgba(34,211,238,0.09), transparent 55%),
var(--bg)
```

**Translucent status fills** (used inline for badges):
- active → `rgba(34,197,94,0.15)` + `--success` text
- inactive → `rgba(100,116,139,0.15)` + `--muted` text
- selection → `rgba(99,102,241,0.35)`; focus ring → `rgba(99,102,241,0.18)`

### 1.2 Public-site theme presets (`sites/<id>/src/themes.js`)

Each preset defines the same variable set. Selected per site (`sites.theme` column) and injected
in `Layout.jsx`. **Names must stay in sync** with `crm/src/themes.js` (preview swatches).

| Theme    | bg        | surface   | border    | accent    | accent2   | text      | muted     | hero gradient                         |
|----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|---------------------------------------|
| midnight | `#09090b` | `#18181b` | `#27272a` | `#818cf8` | `#22d3ee` | `#f4f4f5` | `#a1a1aa` | `#818cf8 → #22d3ee`                   |
| daylight | `#ffffff` | `#f4f4f5` | `#e4e4e7` | `#4f46e5` | `#0891b2` | `#18181b` | `#52525b` | `#6366f1 → #06b6d4`                   |
| ocean    | `#0a1830` | `#0f2547` | `#1e3a5f` | `#38bdf8` | `#22d3ee` | `#e0f2fe` | `#93b4d4` | `#0ea5e9 → #22d3ee`                   |
| sunset   | `#1a0d12` | `#2a141c` | `#43202c` | `#fb7185` | `#fbbf24` | `#fff1f2` | `#d8a3ad` | `#f97316 → #fb7185`                   |
| forest   | `#07120d` | `#0f1c16` | `#1d3327` | `#34d399` | `#a3e635` | `#f0fdf4` | `#8aa898` | `#10b981 → #84cc16`                   |
| royal    | `#140a24` | `#1f0f38` | `#33205a` | `#a855f7` | `#ec4899` | `#f5f3ff` | `#b9a8d8` | `#8b5cf6 → #ec4899`                   |

Each theme also has a `body` (page background — a flat color or 160° gradient) and `hero` (used
for the logo gradient, hero band, and empty-image placeholders via `var(--hero)`). `getTheme(name)`
falls back to `midnight`.

> **Note — known divergence:** the CRM's `--accent` is `#6366f1`; the `midnight` *site* preset's
> accent is `#818cf8`. CRM and sites are intentionally separate palettes that share token *names*.

---

## 2. Typography

- **Family:** `'Inter', sans-serif` (`--font`). Single family throughout.
- **Base:** `body` = `14px`, `line-height: 1.6` (CRM `index.css`).

**Type scale** (observed sizes, in px, across CRM + sites):

| px  | Weight  | Used for                                                        |
|-----|---------|-----------------------------------------------------------------|
| 28  | 700     | Stat-card value (`Dashboard` `StatCard`)                        |
| 22  | 700     | Page title `<h1>` (`Dashboard`, `Sites`)                        |
| 18  | 700     | Sidebar logo                                                    |
| 17  | 700     | Article card title (`ArticleCard`)                              |
| 15  | 600/700 | Section `<h2>`, site-card name                                  |
| 14  | —       | Body base                                                       |
| 13  | 400/600 | Buttons, inputs, body copy in cards                             |
| 12  | —       | Meta text, secondary lines, status detail                      |
| 11  | 600     | Field labels (uppercase), badges, version badge, eyebrow        |

- **Weights in use:** `400` (default), `600` (semibold — labels, buttons, nav active, headings),
  `700` (bold — titles, stat values, logo). No other weights.
- **Line-height:** `1.6` body/paragraphs; `1.4` on card headings.
- **Eyebrow / category label** (`ArticleCard`): `11px`, `600`, `--accent`, `text-transform:
  uppercase`, `letter-spacing: 0.05em`.
- **Gradient text** (logo): `background: var(--grad-accent)` + `-webkit-background-clip: text` +
  `-webkit-text-fill-color: transparent`.

---

## 3. Spacing & layout

No spacing variable exists; values are inline. The **observed scale** (px) is effectively a
4-based step with common values:

```
4 · 5 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32
```

Common usages:

| Context                          | Value                                  |
|----------------------------------|----------------------------------------|
| Page padding                     | `32`                                   |
| Panel / form / stat-card padding | `24` (`20px 24px` on stat cards)       |
| Card padding (CRM site cards)    | `20`                                   |
| Card padding (article cards)     | `16`                                   |
| Section heading bottom margin    | `16`–`28`                              |
| Grid / flex gaps                 | `4`, `8`, `10`, `12`, `16`             |
| Button padding                   | `9px–10px` × `20px` (sm: `5px 12px`)   |
| Input padding                    | `9px 12px`                             |
| Badge / pill padding             | `3px 10px`                             |

**Layout primitives:**
- App shell (`App.jsx`): flex row, `min-height: 100vh`; **sidebar `220px`** fixed
  (`flex-shrink: 0`), `--grad-surface` bg, right border; main is `flex: 1; overflow: auto`.
- Stat grid (`Dashboard`): `grid-template-columns: repeat(4, 1fr); gap: 16`.
- Form grid (`Sites`): `grid-template-columns: 1fr 1fr; gap: 0 16px`.
- Site cards list: `display: grid; gap: 12`.

---

## 4. Radius, borders, elevation, motion

**Border radius:**

| Token / value | Where                                              |
|---------------|----------------------------------------------------|
| `--radius` = `10px` | CRM cards, panels, buttons, inputs           |
| `12px`        | Public-site article cards / theme swatch frame     |
| `20px`        | Status pills / badges                              |
| `8px`         | Card images, placeholder blocks                    |
| `6px`         | Inline code blocks                                 |
| `4px`         | Scrollbar thumb                                    |
| `50%`         | Swatch accent dot                                  |

**Borders:** `1px solid var(--border)` is the default. Active/selected/emphasis state swaps to
`1px solid var(--accent)` (or `2px` on theme swatches). Section dividers: `borderTop/Bottom: 1px
solid var(--border)`.

**Elevation:**
- `--glow` (`0 6px 24px rgba(99,102,241,0.28)`) — primary CTAs, active nav, selected swatch, focus.
- Stat cards: `0 4px 18px rgba(0,0,0,0.25)` + a 3px top accent bar (`background: <grad>`).

**Motion** (`index.css` + inline):
- Buttons: `transition: filter .15s, transform .05s, box-shadow .15s`; hover
  `filter: brightness(1.08)`; active `translateY(1px)`.
- Inputs: focus → border `--accent` + `0 0 0 3px rgba(99,102,241,0.18)` ring.
- Cards (sites): hover → border `--accent` + `translateY(-2px)` (`.2s`).
- Generic interactive transitions: `all .15s`.

**Scrollbar:** `7px`, track `--surface`, thumb `linear-gradient(--accent, --accent2)`.

---

## 5. Component patterns

All are inline-styled and live in the pages/components; they are not yet extracted into a shared
library. Documented here as the canonical recipe. **Rule (`react-crm.md`): define sub-components
at module scope, never inside a render** (avoids remount/focus-loss).

### Button — primary
`background: var(--grad-accent)`, `color: white`, `border: none`, `borderRadius: var(--radius)`,
`padding: 10px 20px`, `fontWeight: 600`, `fontSize: 13`, `boxShadow: var(--glow)`.

### Button — secondary / cancel
`background: var(--border)`, `color: var(--text)`, same radius/padding/weight; no glow.

### Button — small / outline
`background: var(--border)`, `border: 1px solid var(--accent)`, `padding: 5px 12px`,
`fontSize: 11`, `fontWeight: 600`; disabled → `opacity: 0.6`, `cursor: default`.

### Input / select (`inputStyle`, `Sites.jsx`)
`width: 100%`, `background: var(--bg)`, `border: 1px solid var(--border)`,
`borderRadius: var(--radius)`, `padding: 9px 12px`, `color: var(--text)`, `fontSize: 13`.
Focus ring is global (`index.css`). Labels: block, `--muted`, `11px`, `marginBottom: 5`,
typically uppercase.

### Card / panel
`background: var(--surface)` (or `var(--grad-surface)` for emphasis), `border: 1px solid
var(--border)`, `borderRadius: var(--radius)`, `padding: 20–24`. Highlighted form panel adds
`border: 1px solid var(--accent)` + `--glow`.

### Stat card (`Dashboard.StatCard`)
`--grad-surface` bg, `0 4px 18px rgba(0,0,0,0.25)`, `position: relative; overflow: hidden`, with
an absolutely-positioned 3px top bar (`background: grad` prop). Label `12px --muted`; value `28px
700` (color prop); optional sub `12px --muted`. Props: `label, value, sub, color, grad`.

### Status badge / pill
`padding: 3px 10px`, `borderRadius: 20`, `fontSize: 11`, `fontWeight: 600`, translucent fill +
matching token text (see §1.1 status fills).

### Sidebar nav item (`App.jsx`)
flex row, `gap: 10`, `padding: 9px 12px`, `borderRadius: var(--radius)`. Active → `color: #fff`,
`background: var(--grad-accent)`, `boxShadow: var(--glow)`, `fontWeight: 600`. Inactive →
`color: var(--muted)`, transparent, `fontWeight: 400`.

### Theme swatch (`Sites.ThemeSwatch`)
`84px` wide; rounded `10px` frame, `2px` border (`--accent` when selected, else `--border`) +
`--glow` when selected; a `34px` `hero`-gradient band over the preset `bg`, a centered `14px`
accent dot, and a centered `11px 600` label (accent when selected).

### Article card (`sites/.../ArticleCard.jsx`)
`--surface` bg, `1px solid --border`, `borderRadius: 12`, `padding: 16`. Image (`150px`, cover) or
`120px` `var(--hero)` placeholder. Eyebrow category (see §2), `17px 700` title, `13px --muted`
description, meta row (date + `✨ AI` flag). Hover → border `--accent` + `translateY(-2px)`.

### Code / command block
`background: #000`, `color: var(--accent2)`, `borderRadius: 6`, `fontFamily: monospace`,
`fontSize: 12`, `padding: 8px 10px`.

---

## 6. How to reuse / keep in sync

- **CRM:** style with the `index.css` variables and gradient tokens above; inline styles only;
  no Tailwind / UI libs (`react-crm.md`). Bump the version badge in `App.jsx` on CRM changes.
- **Sites:** every page's `getServerSideProps` must pass `theme` to `<Layout>`, which injects the
  preset as CSS variables. Use `var(--…)` so the page recolors per site (`sites-and-themes.md`).
- **Themes:** the preset **name keys** must match across every `sites/<id>/src/themes.js` and
  `crm/src/themes.js`. Adding a theme = add it to all of them.
- **Empty images:** fall back to a `var(--hero)` gradient block, never a broken `<img>`.

> This document is descriptive of the current code. If you change a token or pattern, update the
> source **and** this file so they don't drift (same discipline as the theme `name` keys).
