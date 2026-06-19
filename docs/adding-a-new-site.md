# Adding a New Site — what the CRM does vs. what you must do manually

> **Short answer:** Clicking **+ Add Site** in the CRM only creates a **database record**.
> It does **not** create a running website. The actual Next.js app, its Docker service, and
> the nginx route must be scaffolded separately (use `/new-site` or the `site-scaffolder`
> agent — they do both the infra *and* the DB record in one go).

---

## 1. What "Add Site" in the CRM actually does

The flow is entirely DB-only:

```
CRM "+ Add Site" form  (crm/src/pages/Sites.jsx)
   └─ api.createSite(form)            (crm/src/api/client.js)
        └─ POST /api/sites            (api/src/routes/sites.js)
             └─ INSERT INTO sites (...) RETURNING *
```

The route handler in `api/src/routes/sites.js`:

```js
// POST create site
router.post("/", async (req, res) => {
  const { id, name, niche, domain, adsense_id, theme } = req.body;
  const { rows } = await db.query(
    `INSERT INTO sites (id, name, niche, domain, adsense_id, theme)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,'midnight')) RETURNING *`,
    [id, name, niche, domain, adsense_id, theme]
  );
  res.status(201).json(rows[0]);
});
```

So after submitting the form you get **one new row in the `sites` table** and nothing else.

### What the record gives you
A row in `sites` is enough for the rest of the platform to treat the site as "real":

- **AI content generation** works — `POST /api/ai/generate` and the bulk queue look the site up
  by `site_id`, pick the niche prompt, and write articles into the `articles` table.
- The site appears in **CRM lists** (Sites, AI Generator dropdowns, Revenue, etc.).
- You can set its **theme** and **AdSense ID**.

### What the record does **not** give you
- ❌ No `sites/<id>/` Next.js application folder (no code to render pages).
- ❌ No `docker-compose.yml` service → nothing is built or running on a port.
- ❌ No `nginx/nginx.conf` `upstream`/`server` block → no public route to the site.
- ❌ Nothing is rebuilt or restarted.

**Result:** the niche site has no URL that serves pages. Articles generated for it exist in the
DB but there is no front-end container to display them until the infrastructure is scaffolded.

---

## 2. Why the CRM can't create the whole site

By design the CRM is a thin React client and the API only talks to Postgres:

- `crm/src/api/client.js` only makes HTTP calls; **all** CRM ↔ backend traffic is `fetch` to the API.
- The API routes (`api/src/routes/*`) only run **parameterized SQL** against the database.
- Nothing in the request path can **write files** (`sites/<id>/...`), **edit** `docker-compose.yml`
  or `nginx/nginx.conf`, or **build/restart** Docker containers.

Those are filesystem + Docker-daemon operations that live outside the running app. That is exactly
why the repo ships tooling (`/new-site`, `site-scaffolder`) to do them.

---

## 3. The manual / backend steps required to make a site live

These come straight from `CLAUDE.md` ("How to Add a New Website") and the Docker guardrails.

1. **Create the site folder.** Copy `sites/site-001-ai/` → `sites/<id>/` (keep `public/.gitkeep`
   — the Dockerfile does `COPY /app/public` and fails without it). Update:
   - `package.json` → `name`
   - `src/components/Layout.jsx` → `SITE_NAME` + `NAV`
   - `src/pages/index.jsx` → hero copy for the niche

2. **Add a `docker-compose.yml` service** on the next free port (3003, 3004, …). Pass
   `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_ID` as **BOTH `build.args` and `environment`**.
   > `NEXT_PUBLIC_*` is inlined at **build** time. A runtime-only value is silently ignored and
   > the site falls back to the build default → the classic "published articles don't show up"
   > bug. **Rebuild (`--build`) after changing either.**
   Also add the new service to nginx's `depends_on`.

3. **Add nginx routing** — an `upstream` + `server` block in `nginx/nginx.conf` for the new port.

4. **Register the site record** (set `theme`, `domain`, `adsense_id`):
   - CRM → Sites → **+ Add Site**, **or**
   - `POST /api/sites`.
   *(If you used `/new-site`, this is already done — don't double-create.)*

5. **Niche prompt.** If the niche isn't one of the supported three
   (`artificial-intelligence`, `personal-finance`, `pet-care`), add it to `NICHE_PROMPTS` in
   `api/src/services/generator.js`.
   > ⚠️ The CRM "New Site" form's niche dropdown (`crm/src/pages/Sites.jsx`) also lists
   > `health-wellness` and `technology`, but those have **no** prompt in `NICHE_PROMPTS` yet —
   > selecting one and generating will fall back / fail until a prompt is added.

6. **Rebuild + smoke-test:** `docker compose up --build` (or run `/ship` to rebuild the whole
   stack and verify every page + theme).

> ⚠️ **Theme name sync:** theme presets exist in both `sites/<id>/src/themes.js` and the CRM
> preview copy `crm/src/themes.js`. The `name` keys must stay identical across all of them.

---

## 4. The easy path (recommended) — let tooling do it all

Instead of the six manual steps, run the slash command:

```
/new-site <id> <niche> "Display Name" [domain]
```

…or invoke the **`site-scaffolder`** agent. Either one:
creates the `sites/<id>/` folder, adds the `docker-compose.yml` service on the next free port
(with the correct build args + env), adds the nginx blocks, registers the DB record, and verifies
the result. **This is the same DB row the CRM creates — plus all the infrastructure the CRM
cannot create.** So if you scaffold with `/new-site`, you do **not** also need to click
"+ Add Site" in the CRM.

---

## 5. Decision guide

| Your situation | Do this |
|----------------|---------|
| Want a working site, mostly from the dashboard | CRM **+ Add Site**, then **"Provision files"** on the card, then run the shown `docker compose up -d --build <id> nginx`. (See §6.) |
| Prefer a single CLI step that also builds | Run `/new-site` (or `site-scaffolder` agent), then rebuild. Don't also add it in the CRM. |
| Site folder/Docker/nginx already exist; just need the DB row | Use the CRM **+ Add Site** form (or `POST /api/sites`). |
| Only need to change a theme / domain / AdSense ID on an existing site | Use the CRM (`PATCH /api/sites/:id`). |
| Just want AI to write/queue articles for a site id that already serves pages | CRM record is enough; no infra change needed. |

**Bottom line:** *Can you add a new site from the CRM?* You can add its **record**, yes — but a
record alone is not a website. A live site requires the folder + Docker service + nginx route,
which the CRM cannot create. Use `/new-site` for the full thing.

---

## 6. Implemented — "Provision files" from the dashboard (Option 1: scaffold-to-disk)

The CRM can now scaffold a site's **files** straight from the dashboard. It does **not** build the
container (that still needs one host command), but it removes all the manual file editing.

### How to use it
1. Create the site **record** (CRM → Sites → **+ Add Site**, or `POST /api/sites`).
2. On the site's card, click **"Provision files"**.
3. The card shows the assigned **port**, the files written, and the exact command to finish:
   ```
   docker compose up -d --build <id> nginx
   ```
4. Run that on the **host**, hard-refresh, and open `http://localhost:<port>`.

### What the button does (and doesn't)
- ✅ Clones `sites/site-001-ai/` → `sites/<id>/` and customizes `package.json` (name),
  `Layout.jsx` (SITE_NAME + niche NAV + meta description), and `index.jsx` (hero copy + title).
- ✅ Inserts a `docker-compose.yml` service on the **next free port** (≥ 3003), with
  `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_SITE_ID` as **both build.args and environment**, and adds
  it to nginx's `depends_on`.
- ✅ Inserts the `upstream` + `server` blocks into `nginx/nginx.conf`.
- ❌ Does **not** run `docker compose build`/`up` — no Docker socket is exposed to the API
  (that's the deliberate boundary vs. Option 2). You run the one rebuild command yourself.

### How it's wired (for maintainers)
| Piece | Location |
|-------|----------|
| Scaffolding logic | `api/src/services/scaffolder.js` (`scaffoldSite()`) |
| Endpoint | `POST /api/sites/:id/provision` in `api/src/routes/sites.js` (reads the DB row, scaffolds from it) |
| Repo access | `api` service bind-mounts the repo at `/workspace` (`REPO_ROOT=/workspace`) in `docker-compose.yml` |
| CRM client | `api.provisionSite(id)` in `crm/src/api/client.js` |
| CRM UI | "Provision files" button + result panel in `crm/src/pages/Sites.jsx` |

**Important — enabling the feature:** the API container needs both (a) the new `scaffolder.js`
code, baked in at image build, and (b) the `/workspace` repo mount. After pulling these changes,
recreate the API with a rebuild so both take effect:

```bash
docker compose up -d --build api
```

(Without `--build` the container runs the old image and the route 404s; without recreating it the
`/workspace` mount isn't attached and provisioning fails with a path error.)

**Guardrails baked in:** the scaffolder validates the id, refuses to overwrite an existing
`sites/<id>/` folder or a duplicate compose service, and aborts *before* writing the site folder
if a compose/nginx insertion marker is missing — so a template change fails loudly instead of
producing a half-scaffolded repo. Niche → NAV/hero copy is mapped for the five known niches with a
generic fallback; niches still need a matching `NICHE_PROMPTS` entry in
`api/src/services/generator.js` for AI generation (see §3, step 5).

### Still not automated (future Option 2 / 3)
Zero-touch "click → live site" would require the API to also run `docker compose up --build`,
which means granting it Docker-daemon access (mount `/var/run/docker.sock`) — root-on-host, not
advisable for an internet-facing CRM. The cleaner path for a multi-user/hosted setup is a host-side
watcher that reacts to a provision request and runs the rebuild outside the container. Neither is
implemented; **today site creation = record + "Provision files" + one rebuild command.**
