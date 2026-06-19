---
description: Rebuild the whole stack and verify every site page + theme works
---

Rebuild and smoke-test the entire ZoyZoy Hub stack.

1. `docker compose up -d --build` (note: DB host port is **5433** to avoid conflicts; if a build
   fails on a Next.js site, check `public/.gitkeep` exists and the NEXT_PUBLIC build args are set).
2. Wait for containers, then `docker compose ps` — confirm all are Up.
3. For EACH site container (site-001-ai, site-002-finance, and any others in docker-compose),
   fetch over the docker network from the api container and assert HTTP 200 for:
   `/`, `/privacy`, `/contact`, one `/category/<navslug>`, and one real `/article/<slug>`.
4. Confirm the site's selected theme is applied (its accent hex from `src/themes.js` appears in
   the homepage HTML).
5. Confirm the CRM serves (`<title>ZoyZoy Hub — CRM</title>`) and the API `/health` is ok.

Report a concise pass/fail table. Do not claim success for any check you did not actually run.
