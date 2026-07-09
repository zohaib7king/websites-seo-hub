const router = require("express").Router();
const db = require("../db/pool");
const { generateArticle } = require("../services/generator");
const { processQueue } = require("../services/queueWorker");

// POST /api/ai/generate — generate one article synchronously from a keyword.
// Optional sample_article_id (+ sample_mode override) lets the writer stage
// reference one of the site owner's saved sample articles — see routes/samples.js.
router.post("/generate", async (req, res) => {
  const { site_id, keyword, sample_article_id, sample_mode } = req.body;
  if (!site_id || !keyword) return res.status(400).json({ error: "site_id and keyword required" });

  try {
    const { article, raw, review } = await generateArticle(site_id, keyword, {
      sampleArticleId: sample_article_id || null,
      sampleMode: sample_mode || null,
    });
    res.json({ article, raw, review });
  } catch (err) {
    if (err.code === "SITE_NOT_FOUND") return res.status(404).json({ error: "Site not found" });
    console.error("AI generation error:", err);
    res.status(500).json({ error: "AI generation failed", detail: err.message });
  }
});

// POST /api/ai/bulk — queue multiple keywords at once (does not generate).
// Optional sample_article_id (+ sample_mode) applies to every keyword in this
// batch; queue separate batches if different keywords need different samples.
router.post("/bulk", async (req, res) => {
  const { site_id, keywords, sample_article_id, sample_mode } = req.body;
  if (!Array.isArray(keywords)) return res.status(400).json({ error: "keywords must be array" });

  try {
    const inserts = keywords.map((kw) =>
      db.query(
        `INSERT INTO content_queue (site_id, keyword, scheduled_at, sample_article_id, sample_mode)
         VALUES ($1, $2, NOW(), $3, $4) ON CONFLICT DO NOTHING`,
        [site_id, kw, sample_article_id || null, sample_mode || null]
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
