const router = require("express").Router();
const db = require("../db/pool");
const { scaffoldSite } = require("../services/scaffolder");

// GET all sites
router.get("/", async (_req, res) => {
  const { rows } = await db.query("SELECT * FROM sites ORDER BY created_at DESC");
  res.json(rows);
});

// GET single site
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM sites WHERE id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Site not found" });
  res.json(rows[0]);
});

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

// PATCH update site
router.patch("/:id", async (req, res) => {
  const { name, domain, adsense_id, status, theme } = req.body;
  const { rows } = await db.query(
    `UPDATE sites SET name=COALESCE($1,name), domain=COALESCE($2,domain),
     adsense_id=COALESCE($3,adsense_id), status=COALESCE($4,status),
     theme=COALESCE($5,theme)
     WHERE id=$6 RETURNING *`,
    [name, domain, adsense_id, status, theme, req.params.id]
  );
  res.json(rows[0]);
});

// POST provision site files (scaffold-to-disk: folder + compose + nginx; no build)
// The site must already exist as a DB row; we scaffold from its stored attributes.
router.post("/:id/provision", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM sites WHERE id=$1", [req.params.id]);
    const site = rows[0];
    if (!site) return res.status(404).json({ error: "Site not found — create the record first" });
    const result = await scaffoldSite({
      id: site.id, name: site.name, niche: site.niche, domain: site.domain, theme: site.theme,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: "Provisioning failed", detail: err.message });
  }
});

module.exports = router;
