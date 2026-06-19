const router = require("express").Router();
const db = require("../db/pool");
const { generateArticle } = require("../services/generator");
const { processQueue } = require("../services/queueWorker");

// POST /api/ai/generate — generate one article synchronously from a keyword
router.post("/generate", async (req, res) => {
  const { site_id, keyword } = req.body;
  if (!site_id || !keyword) return res.status(400).json({ error: "site_id and keyword required" });

  try {
    const { article, raw } = await generateArticle(site_id, keyword);
    res.json({ article, raw });
  } catch (err) {
    if (err.code === "SITE_NOT_FOUND") return res.status(404).json({ error: "Site not found" });
    console.error("AI generation error:", err);
    res.status(500).json({ error: "AI generation failed", detail: err.message });
  }
});

// POST /api/ai/bulk — queue multiple keywords at once (does not generate)
router.post("/bulk", async (req, res) => {
  const { site_id, keywords } = req.body;
  if (!Array.isArray(keywords)) return res.status(400).json({ error: "keywords must be array" });

  try {
    const inserts = keywords.map((kw) =>
      db.query(
        `INSERT INTO content_queue (site_id, keyword, scheduled_at)
         VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
        [site_id, kw]
      )
    );
    await Promise.all(inserts);
    res.json({ queued: keywords.length });
  } catch (err) {
    console.error("Bulk queue error:", err);
    res.status(500).json({ error: "Failed to queue keywords", detail: err.message });
  }
});

// POST /api/ai/process-queue — manually drain pending queue items into articles.
// The same worker also runs hourly via cron (see api/src/index.js).
// Body: { "limit": 5 } (optional, defaults to 5).
router.post("/process-queue", async (req, res) => {
  const limit = Number(req.body?.limit) || 5;
  try {
    const result = await processQueue(limit);
    res.json(result);
  } catch (err) {
    console.error("Queue processing error:", err);
    res.status(500).json({ error: "Queue processing failed", detail: err.message });
  }
});

module.exports = router;
