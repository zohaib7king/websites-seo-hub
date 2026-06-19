# Docker & deploy guardrails

- **DB host port is `5433`** (→ container 5432) to avoid clashing with other local Postgres
  containers. Internal services still use `db:5432`. Connect host tools to `localhost:5433`.
- Services talk to each other by container name on `zoyzoy_net` (`http://api:4000`), never
  `localhost`.
- **Next.js sites: `NEXT_PUBLIC_*` is inlined at BUILD time.** Pass `NEXT_PUBLIC_API_URL` and
  `NEXT_PUBLIC_SITE_ID` as BOTH `build.args` and `environment` in `docker-compose.yml`. A
  runtime-only value is silently ignored → "published articles don't show up". Rebuild
  (`--build`) after changing either.
- Every site needs `public/.gitkeep` — the Dockerfile does `COPY /app/public` and fails without it.
- `init.sql` only runs on a fresh volume. Schema changes to an existing DB go through an
  idempotent file in `api/src/db/migrations/` (see `/migrate`), and must also be added to
  `init.sql` for fresh installs.
