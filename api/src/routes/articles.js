const router = require("express").Router();
const db = require("../db/pool");
const slugify = require("slugify");

// GET articles (filter by site_id or status)
router.get("/", async (req, res) => {
  const { site_id, status } = req.query;
  let q = "SELECT * FROM articles WHERE 1=1";
  const params = [];
  if (site_id) { params.push(site_id); q += ` AND site_id=$${params.length}`; }
  if (status)  { params.push(status);  q += ` AND status=$${params.length}`; }
  q += " ORDER BY created_at DESC";
  const { rows } = await db.query(q, params);
  res.json(rows);
});

// GET single article by id
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM articles WHERE id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// POST create article
router.post("/", async (req, res) => {
  const { site_id, title, content, meta_desc, category, tags, status, ai_generated } = req.body;
  const slug = slugify(title, { lower: true, strict: true });
  const published_at = status === "published" ? new Date() : null;
  const { rows } = await db.query(
    `INSERT INTO articles (site_id,title,slug,content,meta_desc,category,tags,status,ai_generated,published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [site_id, title, slug, content, meta_desc, category, tags, status ?? "draft", !!ai_generated, published_at]
  );
  res.status(201).json(rows[0]);
});

// PATCH update article status
router.patch("/:id", async (req, res) => {
  const { status, title, content } = req.body;
  const published_at = status === "published" ? new Date() : undefined;
  const { rows } = await db.query(
    `UPDATE articles SET
       status=COALESCE($1,status),
       title=COALESCE($2,title),
       content=COALESCE($3,content),
       published_at=COALESCE($4,published_at)
     WHERE id=$5 RETURNING *`,
    [status, title, content, published_at ?? null, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE article
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM articles WHERE id=$1", [req.params.id]);
  res.json({ deleted: true });
});

module.exports = router;
