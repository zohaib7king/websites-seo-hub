# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Follow every instruction here before writing any code.

---

## Always-loaded rules

These modular guardrail files are imported so they load every session (the reliable equivalent
of "rules"). Keep them short and current; the changelog below stays historical.

@.claude/rules/docker.md
@.claude/rules/react-crm.md
@.claude/rules/sites-and-themes.md
@.claude/rules/database.md

## Project extensions (`.claude/`)

```
.claude/
├── commands/   ← slash commands:  /new-site  /migrate  /ship
├── agents/     ← subagents:       site-scaffolder
├── rules/      ← guardrails imported into this file (above)
└── settings.local.json
```

- **Commands** (`/new-site`, `/migrate`, `/ship`) encode the repetitive, gotcha-prone workflows.
- **`site-scaffolder`** agent scaffolds a new site following repo conventions.
- Add a project MCP server via `.mcp.json` at the repo root if/when external tools are needed.

---

## Project Overview

**ZoyZoy Hub** is a multi-site content network with an AI-powered CRM.  
The goal: build and manage dozens of niche websites that earn revenue through Google AdSense.  
Content is written automatically by Claude AI and published to each website.

---

## Architecture

```
zoyzoy-hub/
├── CLAUDE.md                ← YOU ARE HERE
├── docker-compose.yml       ← Starts all services together
├── .env / .env.example      ← Secrets (.env never committed)
├── .claude/                 ← Commands, agents, rules (see top of this file)
│
├── api/                     ← Backend REST API (Express)
│   └── src/
│       ├── index.js         ← Server entry + hourly queue cron
│       ├── db/
│       │   ├── pool.js
│       │   ├── init.sql     ← Schema + seed (fresh volume only)
│       │   └── migrations/  ← Idempotent ALTERs for existing DBs (apply via /migrate)
│       ├── services/        ← Shared business logic (NOT in routes)
│       │   ├── generator.js ← generateArticle() + NICHE_PROMPTS (Anthropic call)
│       │   └── queueWorker.js ← processQueue() — drains content_queue
│       └── routes/          ← sites, articles, ai, revenue, queue (thin; call services)
│
├── crm/                     ← Admin Dashboard (React + Vite, port 3000)
│   └── src/
│       ├── App.jsx          ← Router + sidebar (version badge in footer)
│       ├── index.css        ← CRM-only CSS vars + gradient tokens
│       ├── themes.js        ← Theme swatch previews (keep in sync w/ sites)
│       ├── api/client.js    ← ALL fetch calls live here
│       └── pages/           ← Dashboard, Sites, Articles, AIGenerator, Revenue
│
├── sites/                   ← One Next.js app per site (getServerSideProps)
│   ├── site-001-ai/         ← AI Insider Daily (port 3001, id site-001-ai)
│   └── site-002-finance/    ← Finance Daily (port 3002, id site-002)
│       └── src/
│           ├── themes.js              ← 6 theme presets (applied in Layout)
│           ├── lib/data.js            ← getSite / getPublishedArticles / catSlug
│           ├── components/            ← Layout.jsx, ArticleCard.jsx
│           └── pages/                 ← index, article/[slug], category/[slug],
│                                          privacy, contact
│
└── nginx/nginx.conf         ← Reverse proxy (one server block per site port)
```

Each site folder is near-identical; only `Layout.jsx` (SITE_NAME + NAV), `index.jsx`
(hero), and `package.json` differ. Use `/new-site` (or the `site-scaffolder` agent) to add one.

---

## Services & Ports

| Service        | Port  | Tech              |
|----------------|-------|-------------------|
| CRM Dashboard  | 3000  | React + Vite      |
| site-001-ai    | 3001  | Next.js           |
| site-002-finance | 3002 | Next.js (site id `site-002`) |
| API            | 4000  | Node.js + Express |
| PostgreSQL DB  | 5433 (host) → 5432 (container) | Postgres 16 |

> The DB host port is **5433** to avoid clashing with other local Postgres containers
> (n8n, ingress, etc.). Inside the Docker network the API still connects to `db:5432`.

---

## Environment Variables

Always check `.env.example` before running anything.  
Required values in `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...     # From console.anthropic.com
JWT_SECRET=random_long_string
DATABASE_URL=postgresql://zoyzoy:zoyzoy_secret@db:5432/zoyzoy_hub
```

Never hardcode secrets. Always read from `process.env`.

---

## Database Schema

Four tables in PostgreSQL:

```sql
sites          -- id (text PK), name, niche, domain, adsense_id, status,
               -- theme (default 'midnight')
articles       -- id (serial), site_id (FK), title, slug, content, meta_desc,
               -- category, tags[], image_url (nullable), status, ai_generated, published_at
content_queue  -- id (serial), site_id, keyword, status, article_id, scheduled_at
revenue        -- id (serial), site_id, date (unique), impressions, clicks, earnings_usd
```

Article `status` values: `draft` | `scheduled` | `published`  
Queue `status` values: `pending` | `generating` | `done` | `failed`  
`sites.theme` ∈ midnight | daylight | ocean | sunset | forest | royal

> Schema changes: edit `init.sql` (fresh installs) **and** add an idempotent file under
> `api/src/db/migrations/` for existing databases. Apply with `/migrate` or:
> `docker compose exec -T db psql -U zoyzoy -d zoyzoy_hub < api/src/db/migrations/<file>.sql`

---

## AI Content Generation

The generation logic lives in `api/src/services/generator.js` (`generateArticle()`), called
by the `api/src/routes/ai.js` route **and** the queue worker. It uses `@anthropic-ai/sdk`.

**Always use model:** `claude-sonnet-4-6`  
**Always set:** `max_tokens: 2000`

The prompt instructs Claude to return **only valid JSON** with these fields:
```json
{
  "title": "...",
  "meta_desc": "...",
  "category": "...",
  "tags": ["...", "..."],
  "content": "...HTML: <h2>/<h3>, <p>, <ul>/<ol>, and ≥1 <blockquote> key-takeaway..."
}
```

A shared `structureSpec()` (in `generator.js`) enforces: a lead paragraph, ≥1 `<blockquote>`
(rendered as a "Key Takeaway" callout on the sites), H2/H3 hierarchy, an FAQ, and a conclusion
CTA. Niche-specific prompts are in the `NICHE_PROMPTS` object **in
`api/src/services/generator.js`**. Add new niches there.  
Supported niches: `artificial-intelligence`, `personal-finance`, `pet-care`

---

## CRM Design System

All CSS uses variables defined in `crm/src/index.css`:

```css
--bg:       #0d0f14   /* Page background */
--surface:  #161922   /* Cards, panels */
--border:   #242836   /* Borders */
--accent:   #6366f1   /* Primary purple */
--accent2:  #22d3ee   /* Cyan highlights */
--text:     #e2e8f0   /* Main text */
--muted:    #64748b   /* Secondary text */
--success:  #22c55e
--warning:  #f59e0b
--danger:   #ef4444
--radius:   10px
```

**Style rule:** All components use inline styles with these CSS variables. No external UI libraries. No Tailwind.

---

## Coding Rules

### General
- Use `async/await` everywhere, no `.then()` chains
- Always wrap DB queries and API calls in `try/catch`
- Use `const` by default, `let` only when reassigning
- No `var`

### API (Node.js)
- All routes are in `api/src/routes/`
- Each route file exports a single `express.Router()`
- Use `db.query(sql, params)` for all database queries — never string-interpolate SQL
- Return JSON for all responses, including errors: `res.status(4xx).json({ error: "..." })`

### CRM (React)
- Functional components only, use hooks
- Keep API calls in `crm/src/api/client.js` — never `fetch()` directly in components
- Use `useEffect` to load data on mount
- No form tags — use `onClick` and `onChange` handlers only
- No localStorage or sessionStorage

### Websites (Next.js)
- Use `getServerSideProps` to fetch articles from API at request time
- Each site reads `NEXT_PUBLIC_SITE_ID` env var to know which site it is
- **`NEXT_PUBLIC_*` vars are inlined at BUILD time, not runtime.** They must be passed as
  Docker **build args** (see each site's `Dockerfile` ARG/ENV + `docker-compose.yml`
  `build.args`), not just runtime `environment:`. A runtime-only value is silently ignored and
  the site falls back to the build default — the classic "published articles don't show up"
  symptom. After changing a site's API URL or SITE_ID, **rebuild** the image (`--build`).
- Ad placeholder divs use comment `{/* AdSense unit goes here */}`
- Keep Layout component in `src/components/Layout.jsx`

### Docker
- Each service has its own `Dockerfile`
- All services connect via `zoyzoy_net` Docker network
- Services reference each other by container name (e.g. `http://api:4000`)
- Never use `localhost` inside Docker containers

---

## How to Add a New Website

**Preferred:** run `/new-site <id> <niche> "Name" [domain]` (or the `site-scaffolder` agent) —
it does all of the below and verifies the result. Manual steps, if needed:

1. Copy `sites/site-001-ai/` → `sites/<id>/` (keep `public/.gitkeep`). Update `package.json`
   name, and `Layout.jsx` (SITE_NAME + NAV) and `index.jsx` (hero) for the niche.
2. Add a `docker-compose.yml` service on the next free port. Pass `NEXT_PUBLIC_API_URL` +
   `NEXT_PUBLIC_SITE_ID` as **both `build.args` and `environment`** (inlined at build time — see
   the Next.js coding rule). Add the service to nginx `depends_on`.
3. Add `upstream` + `server` blocks in `nginx/nginx.conf`.
4. Register the site (CRM → Sites → Add Site, or `POST /api/sites`) — set its `theme`.
5. Niche prompts live in `api/src/services/generator.js` (`NICHE_PROMPTS`), **not** `ai.js`.
   Add a new niche there if it isn't one of the supported three.

---

## Build / Dev / Test

The whole stack is meant to run via Docker (`docker compose up --build`). To work on a
single service without Docker, install deps in that service folder first (`npm install`),
then:

| Service       | Folder              | Dev                  | Build / Prod                          |
|---------------|---------------------|----------------------|---------------------------------------|
| API           | `api/`              | `npm run dev` (nodemon) | `npm start` (`node src/index.js`)  |
| CRM           | `crm/`              | `npm run dev` (vite) | `npm run build` then `npm run preview` |
| any site      | `sites/<id>/`       | `npm run dev`        | `npm run build` then `npm start`      |

To rebuild + smoke-test the whole stack (all pages + themes on every site), use `/ship`.

- **No test suite and no linter are configured** in any service — there is no `test`/`lint`
  npm script and no Jest/ESLint/Prettier config. Do not invent a `npm test` command; verify
  changes by running the service (or `docker compose up --build`) and exercising the routes.
- Running a service outside Docker needs a reachable PostgreSQL and the env vars from `.env`
  (the API reads `DATABASE_URL`; if `db:5432` isn't resolvable, point it at a local Postgres).

## Common Tasks

### Run locally
```bash
docker compose up --build
```

### View API logs
```bash
docker compose logs api -f
```

### Access database
```bash
docker compose exec db psql -U zoyzoy -d zoyzoy_hub
```

### Generate an article via API
```bash
curl -X POST http://localhost:4000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"site_id": "site-001-ai", "keyword": "Best AI tools 2025"}'
```

### Publish an article
```bash
curl -X PATCH http://localhost:4000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

---

## What to Build Next (Backlog)

- [x] Auto-process content queue on a schedule — done (hourly `node-cron`, see queue section)
- [x] Per-site themes + missing site pages (category/privacy/contact) — done
- [ ] Queue retry/backoff + reaper for stuck `generating` rows (no `failed_jobs` today)
- [ ] Image generation for `articles.image_url` (column exists; sites show a gradient placeholder when empty)
- [ ] AdSense API integration to pull real revenue data
- [ ] Site sitemap.xml + robots.txt generation for SEO
- [ ] User authentication for CRM (JWT login)
- [ ] Site-specific analytics (pageviews per article)

---

## Important Reminders

- The database schema is initialized by `api/src/db/init.sql` on first Docker start
- `site-001-ai` is pre-seeded in the `sites` table
- If you reset Docker volumes, the DB resets too — re-seed manually
- The CRM talks to the API via `VITE_API_URL` env var (default: `http://localhost:4000`)
- Websites talk to API via `NEXT_PUBLIC_API_URL` env var

### Content queue processing
The queue is drained by the worker in `api/src/services/queueWorker.js` (`processQueue()`):
- `POST /api/ai/bulk` inserts keywords into `content_queue` (status defaults to `pending`).
- The worker atomically claims `pending` rows (`FOR UPDATE SKIP LOCKED`), flips them to
  `generating`, calls `generateArticle()`, then marks each `done` (+ `article_id`) or `failed`.
- It runs **hourly via cron** (registered in `api/src/index.js`, disable with `QUEUE_CRON=off`,
  batch size via `QUEUE_BATCH`, default 5) and on demand via `POST /api/ai/process-queue`.
- `GET /api/queue` only **reads** the queue.

### Route surface (verified)
- `sites.js` → GET/POST/PATCH `/api/sites`
- `articles.js` → GET/PATCH/DELETE `/api/articles`
- `ai.js` → POST `/api/ai/generate`, POST `/api/ai/bulk`, POST `/api/ai/process-queue`
- `revenue.js` → GET `/api/revenue`
- `queue.js` → GET `/api/queue`
- `index.js` also exposes `GET /health`

---

## Changelog

### 2026-06-19 — Shared UI library (`@zoyzoy/ui`) + modernized CRM dashboard & sites

- **New package `packages/ui` (`@zoyzoy/ui`)** — a buildable React component library extracted
  from the CRM/sites inline-styled patterns (Button, Badge, Card, StatCard, Input, Field,
  NavItem, CodeBlock, ThemeSwatch, ArticleCard). TypeScript + **tsup** build → `dist/index.js`
  (ESM) + `dist/index.d.ts`. Tokens live in `packages/ui/src/tokens.css`. Full reference:
  `docs/design-system.md`. (Also synced to claude.ai/design — see `.design-sync/`.)
- **CRM adopts `@zoyzoy/ui`** (`crm/package.json` → `"@zoyzoy/ui": "file:../packages/ui"`) and
  was redesigned into a modern admin panel:
  - **Rich Dashboard** (`crm/src/pages/Dashboard.jsx`): KPI cards with trend deltas + sparklines,
    a revenue **area chart** + articles/day **bar chart** (`crm/src/components/Charts.jsx` —
    inline SVG, **no external chart libs**), recent-activity feed, sites overview.
  - **App shell**: refined sidebar + sticky **Topbar** (`crm/src/components/Topbar.jsx`) with a
    working global search that filters Articles via `?q=`. Version badge → **v1.3**.
- **All 6 sites adopt `@zoyzoy/ui` + modernized** (sticky blurred header, gradient hero with
  eyebrow + CTA, library `ArticleCard` wrapped in `next/link` for SEO, modern footer). Per-site
  identity (name/nav/hero) extracted to **`sites/<id>/src/site.config.js`** — the ONLY file that
  differs per site; every other page/component is shared, so the design stays in sync.
- **Docker — build contexts widened to the repo root** so the local `file:` dependency resolves:
  - **CRM** (`docker-compose.yml` `crm.build`): `context: .` + `dockerfile: crm/Dockerfile`
    (builds `packages/ui` first, then the CRM).
  - **Each site**: `context: .` + `dockerfile: sites/<id>/Dockerfile`. Site `next.config.js` sets
    `transpilePackages: ["@zoyzoy/ui"]` + `experimental.outputFileTracingRoot` (repo root) so the
    component compiles into the standalone output; `server.js` now lives at
    `.next/standalone/sites/<id>/server.js` (CMD updated accordingly).
  - New root **`.dockerignore`** keeps the widened context small.
  - Verified: `crm` (`vite build`), `site-001-ai` + `site-003-pets` (`next build` + standalone
    boot) all pass.

### 2026-06-18 — Dashboard-triggered site scaffolding ("Provision files")

- **New `api/src/services/scaffolder.js` (`scaffoldSite()`)** + route
  `POST /api/sites/:id/provision` (in `routes/sites.js`). Given an existing `sites` row it clones
  `sites/site-001-ai/` → `sites/<id>/` (customizing package.json/Layout.jsx/index.jsx), inserts a
  `docker-compose.yml` service on the next free port (build.args + environment) with the nginx
  `depends_on`, and inserts the nginx `upstream`/`server` blocks. It **does NOT build** — it
  returns the `docker compose up -d --build <id> nginx` command for the operator to run.
- **API now bind-mounts the repo at `/workspace`** (`REPO_ROOT=/workspace`) in
  `docker-compose.yml` so the scaffolder can write files. **No Docker socket is exposed** (no
  build-from-API), by design.
- **CRM:** `api.provisionSite(id)` + a **"Provision files"** button and result panel on each site
  card (`crm/src/pages/Sites.jsx`). `client.js` now surfaces the API's `{error, detail}` in thrown
  errors. Version badge → **v1.2**.
- **Enabling it after pull:** `docker compose up -d --build api` (needs the new code baked in AND
  the `/workspace` mount attached). Full rationale + decision guide in
  `docs/adding-a-new-site.md`.

### 2026-06-17 — Site pages, article formatting, per-site themes

- **DB schema:** added `articles.image_url` (TEXT, nullable) and `sites.theme`
  (TEXT default `midnight`). `init.sql` updated for fresh installs; existing DBs are patched by
  `api/src/db/migrations/001_add_image_url_and_theme.sql` (idempotent `ADD COLUMN IF NOT EXISTS`).
- **`api/src/routes/sites.js`** now accepts/saves `theme` on POST and PATCH (parameterized).
- **AI prompt** (`api/src/services/generator.js`) rewritten via a shared `structureSpec()`:
  every niche now produces a lead paragraph, ≥1 `<blockquote>` key-takeaway, H2/H3 structure,
  FAQ, and a conclusion with a niche-specific CTA.
- **Sites (both site-001-ai and site-002-finance) restructured** with shared helpers:
  - `src/themes.js` — 6 theme presets (midnight, daylight, ocean, sunset, forest, royal).
  - `src/lib/data.js` — `getSite()`, `getPublishedArticles()`, `catSlug()`.
  - `src/components/ArticleCard.jsx` — shared card (homepage + category).
  - **New pages**: `category/[slug].jsx`, `privacy.jsx`, `contact.jsx` (header/footer links
    no longer 404). All pages fetch the site's theme and pass it to Layout.
  - **`Layout.jsx`** injects the theme's CSS variables (`--bg/--surface/--accent/--hero/…`) so
    the whole page recolors per site; gradients used in header logo + hero.
  - **`article/[slug].jsx`** redesigned: featured image or gradient placeholder, reading time +
    date, lead/standfirst, callout `<blockquote>` styling ("Key Takeaway"), end CTA box, 720px
    reading column, responsive typography.
- **CRM theme selector** (`crm/src/pages/Sites.jsx` + `crm/src/themes.js`): visual theme
  swatch cards in the create form and on each site card; selecting one PATCHes
  `/api/sites/:id` immediately. **Theme names must stay in sync** between `crm/src/themes.js`
  and each site's `src/themes.js`.

### 2026-06-17 — Finance site, CRM redesign, manual-LLM flow

- **Added `sites/site-002-finance`** (Next.js, port 3002) cloned from site-001-ai with a
  finance theme. Wired into `docker-compose.yml` (`zoyzoy_site_002`) and `nginx.conf` (listen
  3002). Its container sets `NEXT_PUBLIC_SITE_ID=site-002` to match the CRM-registered site id
  `site-002` (note: folder name and site id intentionally differ). The DB row's niche was set
  to `personal-finance` so AI generation uses the finance prompt.
- **Fixed a focus-loss typing bug** in `Sites.jsx` and `AIGenerator.jsx`: small components
  (`Field`, `Input`, `Btn`, `TabBtn`) were defined *inside* the page component, so every
  keystroke created a new component type and React remounted the `<input>`, stealing focus.
  They are now module-scope. **Rule: never define a component inside another component's render.**
- **CRM redesign**: gradient design tokens in `index.css` (`--grad-*`, `--glow`), gradient
  sidebar/nav/buttons/stat-cards, input focus rings. Sidebar footer shows the app version
  (currently `v1.1`) — bump it when shipping CRM changes so a stale browser cache is obvious.
- **AI Generator → new "Manual Prompt" tab**: builds a Google-best-practice article prompt
  (Persona/Task/Context/Format + constraints + E-E-A-T + self-check) to run in any external
  LLM, then pastes the returned JSON back and saves a draft via `api.createArticle`
  (`POST /api/articles`). Works with no `ANTHROPIC_API_KEY`.

### 2026-06-17 — Build + robustness fixes

- **`sites/site-001-ai/public/` added** (with `.gitkeep`). The site Dockerfile copies
  `/app/public`, but the folder didn't exist, so `docker compose up --build` failed at the
  site image. New sites cloned from this folder now inherit it.
- **`POST /api/ai/bulk` and `GET /api/queue` now wrapped in try/catch.** They previously had
  none, so any DB error (even a transient `db` DNS hiccup) became an unhandled rejection that
  **crashed the whole API process**. They now return `500 { error, detail }` like the rest of
  the routes — matching the "wrap all DB queries in try/catch" rule above.
- **DB host port changed `5432` → `5433`** in `docker-compose.yml` to avoid clashing with
  other local Postgres containers (n8n, ingress, etc.). The container still listens on `5432`
  and the API still connects to `db:5432` internally — only the host-published port moved. To
  connect from the host (e.g. psql/DBeaver), use `localhost:5433`.

### 2026-06-16 — Content queue processor + hourly scheduler

Added automatic processing of the content queue (previously keywords were queued but nothing
turned them into articles). **This backend is Node.js/Express, not Laravel** — so if you come
from a Laravel background, here is the same change mapped to concepts you already know:

| What was added | File | Laravel equivalent |
|----------------|------|--------------------|
| `generateArticle()` — keyword → draft article, used by route + worker | `api/src/services/generator.js` | A **Service / Action class** (e.g. `App\Services\ArticleGenerator`) |
| `processQueue()` — claims `pending` rows, generates, marks `done`/`failed` | `api/src/services/queueWorker.js` | A **queued Job** (`GenerateArticle implements ShouldQueue`) + its handler |
| Hourly trigger registered at server startup | `api/src/index.js` (via `node-cron`) | The **scheduler** in `app/Console/Kernel.php` (`$schedule->job(...)->hourly()`) |
| `POST /api/ai/process-queue` manual trigger | `api/src/routes/ai.js` | An artisan command like `php artisan queue:work --once` |

Key differences from the Laravel mental model to keep in mind:

- **No separate queue daemon or broker.** There is no Redis/database queue driver and no
  `php artisan queue:work` process. The "queue" is just the `content_queue` Postgres table,
  and the cron job (running *inside* the API process via `node-cron`) is what drains it. There
  is no Horizon-style supervisor — if the API container restarts, the schedule re-registers on
  boot.
- **Concurrency safety is done in SQL, not by a broker.** Because the cron run and a manual
  `POST /api/ai/process-queue` can overlap, items are claimed with
  `UPDATE ... WHERE id IN (SELECT ... FOR UPDATE SKIP LOCKED)` — the Postgres equivalent of a
  job being reserved so two workers never grab the same row. (Laravel's queue driver hides this
  for you; here it's explicit.)
- **No automatic retries / failed_jobs table.** A failed item is simply set to `status='failed'`
  in `content_queue` (no `tries`, no backoff, no `failed_jobs`). Re-running means flipping it
  back to `pending` manually. Building retry/backoff is a future improvement.
- **Stuck `generating` rows aren't reaped.** If the process dies mid-generation, an item can be
  left in `generating` forever. A future improvement is a timeout sweep (Laravel's
  `retry_after` does this automatically).

Env vars introduced: `QUEUE_CRON` (set to `off` to disable the schedule) and `QUEUE_BATCH`
(items per run, default `5`). New dependency: `node-cron`.

> **After pulling this change, run `npm install` in `api/`** (or rebuild the API image with
> `docker compose up --build`) so `node-cron` is installed — the server won't boot without it.
