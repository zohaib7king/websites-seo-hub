// ── Revenue Route ────────────────────────────────────────
const router = require("express").Router();
const db = require("../db/pool");

router.get("/", async (req, res) => {
  const { site_id, days = 30 } = req.query;
  let q = `SELECT * FROM revenue WHERE date >= NOW() - INTERVAL '${parseInt(days)} days'`;
  const params = [];
  if (site_id) { params.push(site_id); q += ` AND site_id=$${params.length}`; }
  q += " ORDER BY date DESC";
  const { rows } = await db.query(q, params);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { site_id, date, impressions, clicks, earnings_usd } = req.body;
  const { rows } = await db.query(
    `INSERT INTO revenue (site_id,date,impressions,clicks,earnings_usd)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (site_id,date) DO UPDATE
       SET impressions=$3, clicks=$4, earnings_usd=$5
     RETURNING *`,
    [site_id, date, impressions, clicks, earnings_usd]
  );
  res.json(rows[0]);
});

module.exports = router;
