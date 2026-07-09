const router = require("express").Router();
const db = require("../db/pool");

// GET /api/samples?site_id=... — list the site owner's saved sample articles,
// used by the writer stage in generator.js either as a style reference or as
// source material (see sample_articles.default_mode).
router.get("/", async (req, res) => {
  try {
    const { site_id } = req.query;
    const { rows } = site_id
      ? await db.query("SELECT * FROM sample_articles WHERE site_id=$1 ORDER BY created_at DESC", [site_id])
      : await db.query("SELECT * FROM sample_articles ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sample articles", detail: err.message });
  }
});

// POST /api/samples — save one of the site owner's own articles for reuse.
router.post("/", async (req, res) => {
  try {
    const { site_id, title, content, default_mode } = req.body;
    if (!site_id || !title || !content) {
      return res.status(400).json({ error: "site_id, title and content are required" });
    }
    const mode = ["style_reference", "source_material"].includes(default_mode) ? default_mode : "style_reference";
    const { rows } = await db.query(
      `INSERT INTO sample_articles (site_id, title, content, default_mode)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [site_id, title, content, mode]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save sample article", detail: err.message });
  }
});

// DELETE /api/samples/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM sample_articles WHERE id=$1", [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete sample article", detail: err.message });
  }
});

module.exports = router;
