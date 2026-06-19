---
description: Apply DB schema migrations to the running Postgres without losing data
argument-hint: [migration-file-under-api/src/db/migrations]
---

Apply database migration(s) to the live `zoyzoy_db` container. Argument: `$ARGUMENTS`
(a file under `api/src/db/migrations/`; if omitted, apply the latest unapplied one).

Steps:
1. Read the migration SQL from `api/src/db/migrations/`. Migrations must be idempotent
   (`ADD COLUMN IF NOT EXISTS`, etc.) — `init.sql` only runs on a fresh volume, so existing
   databases are patched by these files.
2. Apply it by piping into psql:
   `docker compose exec -T db psql -U zoyzoy -d zoyzoy_hub < <file>`
   (or pass the statements via a heredoc).
3. Verify the change with `information_schema.columns` or `\d <table>`.
4. Make sure the same column/constraint is also present in `api/src/db/init.sql` so fresh
   installs match.

Report what changed and confirm verification output.
