// Content-queue worker.
// Turns `pending` rows in content_queue into draft articles. Safe to run from
// both the hourly cron and the manual POST /api/ai/process-queue route at the
// same time: items are claimed atomically with FOR UPDATE SKIP LOCKED, so two
// concurrent runs never pick the same keyword.
const db = require("../db/pool");
const { generateArticle } = require("./generator");

// Process up to `limit` pending queue items. Returns a summary.
async function processQueue(limit = 5) {
  // Claim a batch: flip pending -> generating in one atomic statement.
  // Rows already locked by another run are skipped instead of waited on.
  const { rows: claimed } = await db.query(
    `UPDATE content_queue
        SET status='generating'
      WHERE id IN (
        SELECT id FROM content_queue
         WHERE status='pending'
         ORDER BY scheduled_at NULLS FIRST, id
         LIMIT $1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING *`,
    [limit]
  );

  const result = { claimed: claimed.length, done: 0, failed: 0, items: [] };

  for (const item of claimed) {
    try {
      const { article } = await generateArticle(item.site_id, item.keyword, {
        sampleArticleId: item.sample_article_id,
        sampleMode: item.sample_mode,
      });
      await db.query(
        "UPDATE content_queue SET status='done', article_id=$1 WHERE id=$2",
        [article.id, item.id]
      );
      result.done++;
      result.items.push({ id: item.id, keyword: item.keyword, status: "done", article_id: article.id });
    } catch (err) {
      console.error(`[queue] item ${item.id} ("${item.keyword}") failed:`, err.message);
      await db.query("UPDATE content_queue SET status='failed' WHERE id=$1", [item.id]);
      result.failed++;
      result.items.push({ id: item.id, keyword: item.keyword, status: "failed", error: err.message });
    }
  }

  return result;
}

module.exports = { processQueue };
