const router = require("express").Router();
const db = require("../db/pool");
const { requireAuth } = require("../services/auth");

// GET all pet stories for a site
router.get("/", async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    if (!siteId) return res.status(400).json({ error: "site_id is required" });
    const { rows } = await db.query(
      "SELECT * FROM pet_stories WHERE site_id=$1 ORDER BY published_at DESC",
      [siteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pet stories", detail: err.message });
  }
});

// POST increment view count
router.post("/view", async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const slug = String(req.body.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });
    const { rows } = await db.query(
      `INSERT INTO pet_stories (site_id, slug, title, content, view_count, like_count)
       VALUES ($1, $2, $2, '', 1, 0)
       ON CONFLICT (site_id, slug)
       DO UPDATE SET view_count = pet_stories.view_count + 1
       RETURNING site_id, slug, view_count, like_count`,
      [siteId, slug]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to record view", detail: err.message });
  }
});

// GET like status for logged-in user
router.get("/like-status", requireAuth, async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    const slug = String(req.query.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });
    if (req.user.site_id !== siteId) return res.status(403).json({ error: "Wrong site account" });
    const { rowCount } = await db.query(
      "SELECT 1 FROM pet_story_likes WHERE site_id=$1 AND slug=$2 AND user_id=$3",
      [siteId, slug, req.user.sub]
    );
    res.json({ liked: rowCount > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch like status", detail: err.message });
  }
});

// POST toggle like
router.post("/like", requireAuth, async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const slug = String(req.body.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });
    if (req.user.site_id !== siteId) return res.status(403).json({ error: "Wrong site account" });

    const existing = await db.query(
      "SELECT 1 FROM pet_story_likes WHERE site_id=$1 AND slug=$2 AND user_id=$3",
      [siteId, slug, req.user.sub]
    );
    const liked = existing.rowCount === 0;

    if (liked) {
      await db.query(
        "INSERT INTO pet_story_likes (site_id, slug, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [siteId, slug, req.user.sub]
      );
      await db.query(
        `INSERT INTO pet_stories (site_id, slug, title, content, view_count, like_count)
         VALUES ($1, $2, $2, '', 0, 1)
         ON CONFLICT (site_id, slug)
         DO UPDATE SET like_count = pet_stories.like_count + 1`,
        [siteId, slug]
      );
    } else {
      await db.query(
        "DELETE FROM pet_story_likes WHERE site_id=$1 AND slug=$2 AND user_id=$3",
        [siteId, slug, req.user.sub]
      );
      await db.query(
        "UPDATE pet_stories SET like_count = GREATEST(like_count - 1, 0) WHERE site_id=$1 AND slug=$2",
        [siteId, slug]
      );
    }

    const { rows } = await db.query(
      "SELECT view_count, like_count FROM pet_stories WHERE site_id=$1 AND slug=$2",
      [siteId, slug]
    );
    res.json({
      liked,
      view_count: rows[0]?.view_count ?? 0,
      like_count: rows[0]?.like_count ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like", detail: err.message });
  }
});

// GET single pet story by slug (must be after static paths)
router.get("/:slug", async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    const slug = String(req.params.slug || "").trim();
    if (!siteId || !slug) return res.status(400).json({ error: "site_id and slug are required" });
    const { rows } = await db.query(
      "SELECT * FROM pet_stories WHERE site_id=$1 AND slug=$2",
      [siteId, slug]
    );
    if (!rows[0]) return res.status(404).json({ error: "Story not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pet story", detail: err.message });
  }
});

module.exports = router;
