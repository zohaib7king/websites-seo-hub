const router = require("express").Router();
const db = require("../db/pool");

router.get("/", async (req, res) => {
  try {
    const { site_id, status } = req.query;
    let q = "SELECT * FROM content_queue WHERE 1=1";
    const params = [];
    if (site_id) { params.push(site_id); q += ` AND site_id=$${params.length}`; }
    if (status)  { params.push(status);  q += ` AND status=$${params.length}`; }
    q += " ORDER BY created_at DESC";
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error("Queue list error:", err);
    res.status(500).json({ error: "Failed to load queue", detail: err.message });
  }
});

module.exports = router;
