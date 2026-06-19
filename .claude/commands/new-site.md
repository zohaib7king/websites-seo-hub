---
description: Scaffold a brand-new website end to end (site folder, docker-compose, nginx, DB record, rebuild)
argument-hint: <site-id> <niche> "<Display Name>" [domain]
---

Scaffold a new ZoyZoy Hub website. Arguments: `$ARGUMENTS`
(order: site-id, niche, "Display Name", optional domain)

Follow this exact sequence — it encodes gotchas already learned in this repo:

1. **Clone the folder**: copy `sites/site-001-ai/` to `sites/<site-id>/`. Update
   `package.json` `name`, and in `Layout.jsx` set `SITE_NAME` and the `NAV` category list
   to match the niche. Update the hero text in `index.jsx`. Keep `src/themes.js`,
   `src/lib/data.js`, `ArticleCard.jsx`, and all pages identical.
2. **Keep `public/.gitkeep`** — the Dockerfile copies `/app/public`; a missing folder fails the build.
3. **docker-compose.yml**: add a `<site-id>` service modeled on `site-002-finance`, on the next
   free host port (3003, 3004, …). It MUST pass `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_ID`
   as BOTH `build.args` AND `environment` — NEXT_PUBLIC_* is inlined at build time. Add the
   service to nginx's `depends_on`.
4. **nginx/nginx.conf**: add an `upstream` and a `server { listen <port>; ... }` block.
5. **Register in DB** (parameterized): insert/confirm the site row with id, name, niche, domain,
   and a `theme` (default 'midnight'), e.g. via `POST /api/sites` or psql.
6. **Build + verify**: `docker compose up -d --build <site-id> nginx`, then confirm the homepage,
   `/privacy`, `/contact`, a `/category/<x>`, and an `/article/<slug>` all return HTTP 200, and
   the theme accent color appears in the HTML.

Report the new port and the URLs to open.
