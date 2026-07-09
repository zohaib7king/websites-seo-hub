const router = require("express").Router();
const db = require("../db/pool");
const { requireAuth } = require("../services/auth");

// GET all user pet stories for a site
router.get("/", async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    if (!siteId) return res.status(400).json({ error: "site_id is required" });
    const { rows } = await db.query(
      `SELECT s.*, u.email AS author_email
       FROM user_pet_stories s
       JOIN site_users u ON u.id = s.user_id
       WHERE s.site_id=$1 AND s.status='published'
       ORDER BY s.created_at DESC`,
      [siteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user pet stories", detail: err.message });
  }
});

// POST create user pet story (auth required)
router.post("/", requireAuth, async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    const imageUrl = req.body.image_url ? String(req.body.image_url).trim() : null;
    const petType = req.body.pet_type ? String(req.body.pet_type).trim() : null;
    if (!siteId || !title || !content) {
      return res.status(400).json({ error: "site_id, title, and content are required" });
    }
    if (req.user.site_id !== siteId) return res.status(403).json({ error: "Wrong site account" });

    const { rows } = await db.query(
      `INSERT INTO user_pet_stories (site_id, user_id, title, content, image_url, pet_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [siteId, req.user.sub, title, content, imageUrl, petType]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user pet story", detail: err.message });
  }
});

// POST increment view count
router.post("/view", async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const id = Number(req.body.id);
    if (!siteId || !id) return res.status(400).json({ error: "site_id and id are required" });
    const { rows } = await db.query(
      `UPDATE user_pet_stories SET view_count = view_count + 1
       WHERE site_id=$1 AND id=$2
       RETURNING id, view_count, like_count`,
      [siteId, id]
    );
    if (!rows[0]) return res.json({ id, view_count: 1, like_count: 0 });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to record view", detail: err.message });
  }
});

// GET like status
router.get("/like-status", requireAuth, async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    const id = Number(req.query.id);
    if (!siteId || !id) return res.status(400).json({ error: "site_id and id are required" });
    if (req.user.site_id !== siteId) return res.status(403).json({ error: "Wrong site account" });
    const { rowCount } = await db.query(
      "SELECT 1 FROM user_pet_story_likes WHERE site_id=$1 AND story_id=$2 AND user_id=$3",
      [siteId, id, req.user.sub]
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
    const id = Number(req.body.id);
    if (!siteId || !id) return res.status(400).json({ error: "site_id and id are required" });
    if (req.user.site_id !== siteId) return res.status(403).json({ error: "Wrong site account" });

    const existing = await db.query(
      "SELECT 1 FROM user_pet_story_likes WHERE site_id=$1 AND story_id=$2 AND user_id=$3",
      [siteId, id, req.user.sub]
    );
    const liked = existing.rowCount === 0;

    if (liked) {
      await db.query(
        "INSERT INTO user_pet_story_likes (site_id, story_id, user_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [siteId, id, req.user.sub]
      );
      await db.query(
        "UPDATE user_pet_stories SET like_count = like_count + 1 WHERE site_id=$1 AND id=$2",
        [siteId, id]
      );
    } else {
      await db.query(
        "DELETE FROM user_pet_story_likes WHERE site_id=$1 AND story_id=$2 AND user_id=$3",
        [siteId, id, req.user.sub]
      );
      await db.query(
        "UPDATE user_pet_stories SET like_count = GREATEST(like_count - 1, 0) WHERE site_id=$1 AND id=$2",
        [siteId, id]
      );
    }

    const { rows } = await db.query(
      "SELECT view_count, like_count FROM user_pet_stories WHERE site_id=$1 AND id=$2",
      [siteId, id]
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

// GET single user pet story (must be after static paths)
router.get("/:id", async (req, res) => {
  try {
    const siteId = String(req.query.site_id || "").trim();
    const id = Number(req.params.id);
    if (!siteId || !id) return res.status(400).json({ error: "site_id and id are required" });
    const { rows } = await db.query(
      `SELECT s.*, u.email AS author_email
       FROM user_pet_stories s
       JOIN site_users u ON u.id = s.user_id
       WHERE s.site_id=$1 AND s.id=$2 AND s.status='published'`,
      [siteId, id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Story not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user pet story", detail: err.message });
  }
});

module.exports = router;
