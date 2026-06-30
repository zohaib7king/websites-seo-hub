const router = require("express").Router();
const db = require("../db/pool");
const slugify = require("slugify");
const { requireAuth } = require("../services/auth");

// GET articles (filter by site_id or status)
router.get("/", async (req, res) => {
  try {
    const { site_id, status } = req.query;
    let q = `
      SELECT a.*,
        COALESCE(s.view_count, a.view_count, 0) AS view_count,
        COALESCE(s.like_count, a.like_count, 0) AS like_count
      FROM articles a
      LEFT JOIN article_stats s ON s.site_id = a.site_id AND s.slug = a.slug
      WHERE 1=1`;
    const params = [];
    if (site_id) { params.push(site_id); q += ` AND a.site_id=$${params.length}`; }
    if (status)  { params.push(status);  q += ` AND a.status=$${params.length}`; }
    q += " ORDER BY a.created_at DESC";
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles", detail: err.message });
  }
});

// GET persisted stats for a site; used by seed/fallback articles too.
router.get("/stats", async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    if (!siteId) return res.status(400).json({ error: "site_id is required" });
    const { rows } = await db.query(
      "SELECT site_id, slug, view_count, like_count FROM article_stats WHERE site_id=$1",
      [siteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch article stats", detail: err.message });
  }
});

// POST increment article view count by site + slug.
router.post("/stats/view", async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const slug = String(req.body.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });

    const { rows } = await db.query(
      `INSERT INTO article_stats (site_id, slug, view_count, like_count)
       VALUES ($1, $2, 1, 0)
       ON CONFLICT (site_id, slug)
       DO UPDATE SET view_count = article_stats.view_count + 1, updated_at = NOW()
       RETURNING site_id, slug, view_count, like_count`,
      [siteId, slug]
    );
    await db.query(
      "UPDATE articles SET view_count=$1 WHERE site_id=$2 AND slug=$3",
      [rows[0].view_count, siteId, slug]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to record article view", detail: err.message });
  }
});

// POST toggle article like by logged-in user.
router.post("/stats/like", requireAuth, async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const slug = String(req.body.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });
    if (req.user.site_id !== siteId) return res.status(403).json({ error: "Wrong site account" });

    const existing = await db.query(
      "SELECT 1 FROM article_likes WHERE site_id=$1 AND slug=$2 AND user_id=$3",
      [siteId, slug, req.user.sub]
    );
    const liked = existing.rowCount === 0;

    if (liked) {
      await db.query(
        "INSERT INTO article_likes (site_id, slug, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [siteId, slug, req.user.sub]
      );
    } else {
      await db.query(
        "DELETE FROM article_likes WHERE site_id=$1 AND slug=$2 AND user_id=$3",
        [siteId, slug, req.user.sub]
      );
    }

    const { rows } = await db.query(
      `INSERT INTO article_stats (site_id, slug, view_count, like_count)
       VALUES ($1, $2, 0, $3)
       ON CONFLICT (site_id, slug)
       DO UPDATE SET
         like_count = GREATEST(article_stats.like_count + $3, 0),
         updated_at = NOW()
       RETURNING site_id, slug, view_count, like_count`,
      [siteId, slug, liked ? 1 : -1]
    );
    await db.query(
      "UPDATE articles SET like_count=$1 WHERE site_id=$2 AND slug=$3",
      [rows[0].like_count, siteId, slug]
    );
    res.json({ ...rows[0], liked });
  } catch (err) {
    res.status(500).json({ error: "Failed to update article like", detail: err.message });
  }
});

// GET current user's like status for an article.
router.get("/stats/like", requireAuth, async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    const slug = String(req.query.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });
    const { rowCount } = await db.query(
      "SELECT 1 FROM article_likes WHERE site_id=$1 AND slug=$2 AND user_id=$3",
      [siteId, slug, req.user.sub]
    );
    res.json({ liked: rowCount > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch like status", detail: err.message });
  }
});

// GET single article by id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM articles WHERE id=$1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch article", detail: err.message });
  }
});

// POST create article
router.post("/", async (req, res) => {
  try {
    const { site_id, title, content, meta_desc, category, tags, status, ai_generated } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const published_at = status === "published" ? new Date() : null;
    const { rows } = await db.query(
      `INSERT INTO articles (site_id,title,slug,content,meta_desc,category,tags,status,ai_generated,published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [site_id, title, slug, content, meta_desc, category, tags, status ?? "draft", !!ai_generated, published_at]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create article", detail: err.message });
  }
});

// PATCH update article status
router.patch("/:id", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: "Failed to update article", detail: err.message });
  }
});

// DELETE article
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM articles WHERE id=$1", [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete article", detail: err.message });
  }
});

module.exports = router;
