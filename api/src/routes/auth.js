const router = require("express").Router();
const db = require("../db/pool");
const { createToken, hashPassword, requireAuth, verifyPassword } = require("../services/auth");

function publicUser(user) {
  return { id: user.id || user.sub, site_id: user.site_id, email: user.email };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

router.post("/signup", async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!siteId || !email || password.length < 6) {
      return res.status(400).json({ error: "Site, email, and a 6+ character password are required" });
    }

    const { rows } = await db.query(
      `INSERT INTO site_users (site_id, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (site_id, email) DO NOTHING
       RETURNING id, site_id, email`,
      [siteId, email, hashPassword(password)]
    );
    if (!rows[0]) return res.status(409).json({ error: "Account already exists. Please login." });

    res.status(201).json({ user: publicUser(rows[0]), token: createToken(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: "Failed to create account", detail: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const siteId = String(req.body.site_id || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!siteId || !email || !password) {
      return res.status(400).json({ error: "Site, email, and password are required" });
    }

    const { rows } = await db.query(
      "SELECT id, site_id, email, password_hash FROM site_users WHERE site_id=$1 AND email=$2",
      [siteId, email]
    );
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ user: publicUser(user), token: createToken(user) });
  } catch (err) {
    res.status(500).json({ error: "Failed to login", detail: err.message });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
