const router = require("express").Router();
const db = require("../db/pool");
const path = require("path");
const fs = require("fs");
const { sendInquiryEmail } = require("../services/mailer");

const SITE_ID = "site-007-video-editor";
const UPLOAD_ROOT = process.env.VIDEO_EDITOR_UPLOAD_DIR
  || path.join(__dirname, "../../uploads/video-editor");

function siteId(req) {
  return req.params.siteId || req.query.site_id || SITE_ID;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || `item-${Date.now()}`;
}

// ── Public bundle (SSR) ──────────────────────────────────
router.get("/:siteId/bundle", async (req, res) => {
  try {
    const id = siteId(req);
    const [settings, portfolio, services, testimonials, thumbnails, team] = await Promise.all([
      db.query("SELECT * FROM editor_settings WHERE site_id=$1", [id]),
      db.query(
        `SELECT * FROM editor_portfolio WHERE site_id=$1 AND status='published'
         ORDER BY sort_order ASC, id DESC`,
        [id]
      ),
      db.query(
        `SELECT * FROM editor_services WHERE site_id=$1 AND status='published'
         ORDER BY sort_order ASC, id ASC`,
        [id]
      ),
      db.query(
        `SELECT * FROM editor_testimonials WHERE site_id=$1 AND status='published'
         ORDER BY sort_order ASC, id ASC`,
        [id]
      ),
      db.query(
        `SELECT * FROM editor_thumbnails WHERE site_id=$1 AND status='published'
         ORDER BY sort_order ASC, id ASC`,
        [id]
      ),
      db.query(
        `SELECT * FROM editor_team WHERE site_id=$1 AND status='published'
         ORDER BY sort_order ASC, id ASC`,
        [id]
      ),
    ]);
    res.json({
      settings: settings.rows[0] || null,
      portfolio: portfolio.rows,
      services: services.rows,
      testimonials: testimonials.rows,
      thumbnails: thumbnails.rows,
      team: team.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load editor bundle", detail: err.message });
  }
});

// ── Settings ─────────────────────────────────────────────
router.get("/:siteId/settings", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM editor_settings WHERE site_id=$1", [siteId(req)]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings", detail: err.message });
  }
});

router.put("/:siteId/settings", async (req, res) => {
  try {
    const id = siteId(req);
    const b = req.body || {};
    const fields = [
      "brand_name", "tagline", "eyebrow", "hero_lead", "hero_accent", "hero_cta",
      "about_title", "about_body", "contact_title", "contact_body",
      "email", "phone", "location", "notify_email", "whatsapp_message",
      "social_instagram", "social_youtube", "social_vimeo", "social_whatsapp", "footer_note",
    ];
    const values = fields.map((f) => (b[f] !== undefined ? b[f] : null));
    const { rows } = await db.query(
      `INSERT INTO editor_settings (
         site_id, brand_name, tagline, eyebrow, hero_lead, hero_accent, hero_cta,
         about_title, about_body, contact_title, contact_body,
         email, phone, location, notify_email, whatsapp_message,
         social_instagram, social_youtube, social_vimeo, social_whatsapp, footer_note, updated_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW()
       )
       ON CONFLICT (site_id) DO UPDATE SET
         brand_name=COALESCE(EXCLUDED.brand_name, editor_settings.brand_name),
         tagline=COALESCE(EXCLUDED.tagline, editor_settings.tagline),
         eyebrow=COALESCE(EXCLUDED.eyebrow, editor_settings.eyebrow),
         hero_lead=COALESCE(EXCLUDED.hero_lead, editor_settings.hero_lead),
         hero_accent=COALESCE(EXCLUDED.hero_accent, editor_settings.hero_accent),
         hero_cta=COALESCE(EXCLUDED.hero_cta, editor_settings.hero_cta),
         about_title=COALESCE(EXCLUDED.about_title, editor_settings.about_title),
         about_body=COALESCE(EXCLUDED.about_body, editor_settings.about_body),
         contact_title=COALESCE(EXCLUDED.contact_title, editor_settings.contact_title),
         contact_body=COALESCE(EXCLUDED.contact_body, editor_settings.contact_body),
         email=COALESCE(EXCLUDED.email, editor_settings.email),
         phone=COALESCE(EXCLUDED.phone, editor_settings.phone),
         location=COALESCE(EXCLUDED.location, editor_settings.location),
         notify_email=COALESCE(EXCLUDED.notify_email, editor_settings.notify_email),
         whatsapp_message=COALESCE(EXCLUDED.whatsapp_message, editor_settings.whatsapp_message),
         social_instagram=COALESCE(EXCLUDED.social_instagram, editor_settings.social_instagram),
         social_youtube=COALESCE(EXCLUDED.social_youtube, editor_settings.social_youtube),
         social_vimeo=COALESCE(EXCLUDED.social_vimeo, editor_settings.social_vimeo),
         social_whatsapp=COALESCE(EXCLUDED.social_whatsapp, editor_settings.social_whatsapp),
         footer_note=COALESCE(EXCLUDED.footer_note, editor_settings.footer_note),
         updated_at=NOW()
       RETURNING *`,
      [id, ...values]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings", detail: err.message });
  }
});

// ── Portfolio ────────────────────────────────────────────
router.get("/:siteId/portfolio", async (req, res) => {
  try {
    const id = siteId(req);
    const all = req.query.all === "1";
    const { rows } = await db.query(
      all
        ? `SELECT * FROM editor_portfolio WHERE site_id=$1 ORDER BY sort_order ASC, id DESC`
        : `SELECT * FROM editor_portfolio WHERE site_id=$1 AND status='published' ORDER BY sort_order ASC, id DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch portfolio", detail: err.message });
  }
});

router.get("/:siteId/portfolio/:slug", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM editor_portfolio WHERE site_id=$1 AND slug=$2",
      [siteId(req), req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: "Project not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project", detail: err.message });
  }
});

router.post("/:siteId/portfolio", async (req, res) => {
  try {
    const id = siteId(req);
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ error: "title is required" });
    const slug = b.slug || slugify(b.title);
    const { rows } = await db.query(
      `INSERT INTO editor_portfolio
         (site_id, title, slug, description, category, video_url, thumbnail_url, client_name, featured, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        id, b.title, slug, b.description || null, b.category || null,
        b.video_url || null, b.thumbnail_url || null, b.client_name || null,
        !!b.featured, Number(b.sort_order) || 0, b.status || "published",
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create portfolio item", detail: err.message });
  }
});

router.patch("/:siteId/portfolio/:id", async (req, res) => {
  try {
    const b = req.body || {};
    const { rows } = await db.query(
      `UPDATE editor_portfolio SET
         title=COALESCE($3, title),
         slug=COALESCE($4, slug),
         description=COALESCE($5, description),
         category=COALESCE($6, category),
         video_url=COALESCE($7, video_url),
         thumbnail_url=COALESCE($8, thumbnail_url),
         client_name=COALESCE($9, client_name),
         featured=COALESCE($10, featured),
         sort_order=COALESCE($11, sort_order),
         status=COALESCE($12, status)
       WHERE site_id=$1 AND id=$2
       RETURNING *`,
      [
        siteId(req), req.params.id,
        b.title ?? null, b.slug ?? null, b.description ?? null, b.category ?? null,
        b.video_url ?? null, b.thumbnail_url ?? null, b.client_name ?? null,
        b.featured === undefined ? null : !!b.featured,
        b.sort_order === undefined ? null : Number(b.sort_order),
        b.status ?? null,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Project not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update portfolio item", detail: err.message });
  }
});

router.delete("/:siteId/portfolio/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM editor_portfolio WHERE site_id=$1 AND id=$2",
      [siteId(req), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Project not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete portfolio item", detail: err.message });
  }
});

// ── Services ─────────────────────────────────────────────
router.get("/:siteId/services", async (req, res) => {
  try {
    const id = siteId(req);
    const all = req.query.all === "1";
    const { rows } = await db.query(
      all
        ? `SELECT * FROM editor_services WHERE site_id=$1 ORDER BY sort_order ASC, id ASC`
        : `SELECT * FROM editor_services WHERE site_id=$1 AND status='published' ORDER BY sort_order ASC, id ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services", detail: err.message });
  }
});

router.post("/:siteId/services", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ error: "title is required" });
    const features = Array.isArray(b.features)
      ? b.features
      : String(b.features || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const { rows } = await db.query(
      `INSERT INTO editor_services (site_id, title, description, price_label, features, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        siteId(req), b.title, b.description || null, b.price_label || null,
        features, Number(b.sort_order) || 0, b.status || "published",
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create service", detail: err.message });
  }
});

router.patch("/:siteId/services/:id", async (req, res) => {
  try {
    const b = req.body || {};
    let features = null;
    if (b.features !== undefined) {
      features = Array.isArray(b.features)
        ? b.features
        : String(b.features || "").split("\n").map((s) => s.trim()).filter(Boolean);
    }
    const { rows } = await db.query(
      `UPDATE editor_services SET
         title=COALESCE($3, title),
         description=COALESCE($4, description),
         price_label=COALESCE($5, price_label),
         features=COALESCE($6, features),
         sort_order=COALESCE($7, sort_order),
         status=COALESCE($8, status)
       WHERE site_id=$1 AND id=$2
       RETURNING *`,
      [
        siteId(req), req.params.id,
        b.title ?? null, b.description ?? null, b.price_label ?? null,
        features, b.sort_order === undefined ? null : Number(b.sort_order),
        b.status ?? null,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Service not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update service", detail: err.message });
  }
});

router.delete("/:siteId/services/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM editor_services WHERE site_id=$1 AND id=$2",
      [siteId(req), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Service not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service", detail: err.message });
  }
});

// ── Testimonials ─────────────────────────────────────────
router.get("/:siteId/testimonials", async (req, res) => {
  try {
    const id = siteId(req);
    const all = req.query.all === "1";
    const { rows } = await db.query(
      all
        ? `SELECT * FROM editor_testimonials WHERE site_id=$1 ORDER BY sort_order ASC, id ASC`
        : `SELECT * FROM editor_testimonials WHERE site_id=$1 AND status='published' ORDER BY sort_order ASC, id ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch testimonials", detail: err.message });
  }
});

router.post("/:siteId/testimonials", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.client_name || !b.quote) {
      return res.status(400).json({ error: "client_name and quote are required" });
    }
    const { rows } = await db.query(
      `INSERT INTO editor_testimonials
         (site_id, client_name, client_role, quote, rating, avatar_url, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        siteId(req), b.client_name, b.client_role || null, b.quote,
        Number(b.rating) || 5, b.avatar_url || null,
        Number(b.sort_order) || 0, b.status || "published",
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create testimonial", detail: err.message });
  }
});

router.patch("/:siteId/testimonials/:id", async (req, res) => {
  try {
    const b = req.body || {};
    const { rows } = await db.query(
      `UPDATE editor_testimonials SET
         client_name=COALESCE($3, client_name),
         client_role=COALESCE($4, client_role),
         quote=COALESCE($5, quote),
         rating=COALESCE($6, rating),
         avatar_url=COALESCE($7, avatar_url),
         sort_order=COALESCE($8, sort_order),
         status=COALESCE($9, status)
       WHERE site_id=$1 AND id=$2
       RETURNING *`,
      [
        siteId(req), req.params.id,
        b.client_name ?? null, b.client_role ?? null, b.quote ?? null,
        b.rating === undefined ? null : Number(b.rating),
        b.avatar_url ?? null,
        b.sort_order === undefined ? null : Number(b.sort_order),
        b.status ?? null,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Testimonial not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update testimonial", detail: err.message });
  }
});

router.delete("/:siteId/testimonials/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM editor_testimonials WHERE site_id=$1 AND id=$2",
      [siteId(req), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Testimonial not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete testimonial", detail: err.message });
  }
});

// ── Inquiries (public POST, admin GET/PATCH) ─────────────
router.get("/:siteId/inquiries", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM editor_inquiries WHERE site_id=$1 ORDER BY created_at DESC`,
      [siteId(req)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inquiries", detail: err.message });
  }
});

router.post("/:siteId/inquiries", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.email || !b.message) {
      return res.status(400).json({ error: "name, email, and message are required" });
    }
    const { rows } = await db.query(
      `INSERT INTO editor_inquiries (site_id, name, email, phone, project_type, message)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at`,
      [
        siteId(req), b.name.trim(), b.email.trim(),
        b.phone || null, b.project_type || null, b.message.trim(),
      ]
    );

    try {
      const settingsRes = await db.query(
        "SELECT brand_name, email, notify_email FROM editor_settings WHERE site_id=$1",
        [siteId(req)]
      );
      const s = settingsRes.rows[0] || {};
      await sendInquiryEmail({
        to: s.notify_email || s.email,
        siteName: s.brand_name,
        inquiry: {
          name: b.name.trim(),
          email: b.email.trim(),
          phone: b.phone,
          project_type: b.project_type,
          message: b.message.trim(),
        },
      });
    } catch (mailErr) {
      console.error("[inquiry email]", mailErr.message);
    }

    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit inquiry", detail: err.message });
  }
});

router.patch("/:siteId/inquiries/:id", async (req, res) => {
  try {
    const status = req.body?.status;
    if (!status) return res.status(400).json({ error: "status is required" });
    const { rows } = await db.query(
      `UPDATE editor_inquiries SET status=$3 WHERE site_id=$1 AND id=$2 RETURNING *`,
      [siteId(req), req.params.id, status]
    );
    if (!rows[0]) return res.status(404).json({ error: "Inquiry not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inquiry", detail: err.message });
  }
});

router.delete("/:siteId/inquiries/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM editor_inquiries WHERE site_id=$1 AND id=$2",
      [siteId(req), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Inquiry not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inquiry", detail: err.message });
  }
});

// ── Thumbnails (reel / showcase) ─────────────────────────
router.get("/:siteId/thumbnails", async (req, res) => {
  try {
    const id = siteId(req);
    const all = req.query.all === "1";
    const { rows } = await db.query(
      all
        ? `SELECT * FROM editor_thumbnails WHERE site_id=$1 ORDER BY sort_order ASC, id ASC`
        : `SELECT * FROM editor_thumbnails WHERE site_id=$1 AND status='published' ORDER BY sort_order ASC, id ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch thumbnails", detail: err.message });
  }
});

router.post("/:siteId/thumbnails", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.thumbnail_url) {
      return res.status(400).json({ error: "title and thumbnail_url are required" });
    }
    const { rows } = await db.query(
      `INSERT INTO editor_thumbnails (site_id, title, thumbnail_url, video_url, category, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        siteId(req), b.title, b.thumbnail_url, b.video_url || null, b.category || null,
        Number(b.sort_order) || 0, b.status || "published",
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create thumbnail", detail: err.message });
  }
});

router.patch("/:siteId/thumbnails/:id", async (req, res) => {
  try {
    const b = req.body || {};
    const { rows } = await db.query(
      `UPDATE editor_thumbnails SET
         title=COALESCE($3, title),
         thumbnail_url=COALESCE($4, thumbnail_url),
         video_url=COALESCE($5, video_url),
         category=COALESCE($6, category),
         sort_order=COALESCE($7, sort_order),
         status=COALESCE($8, status)
       WHERE site_id=$1 AND id=$2 RETURNING *`,
      [
        siteId(req), req.params.id,
        b.title ?? null, b.thumbnail_url ?? null, b.video_url ?? null, b.category ?? null,
        b.sort_order === undefined ? null : Number(b.sort_order), b.status ?? null,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Thumbnail not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update thumbnail", detail: err.message });
  }
});

router.delete("/:siteId/thumbnails/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM editor_thumbnails WHERE site_id=$1 AND id=$2",
      [siteId(req), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Thumbnail not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete thumbnail", detail: err.message });
  }
});

// ── Team members ───────────────────────────────────────────
router.get("/:siteId/team", async (req, res) => {
  try {
    const id = siteId(req);
    const all = req.query.all === "1";
    const { rows } = await db.query(
      all
        ? `SELECT * FROM editor_team WHERE site_id=$1 ORDER BY sort_order ASC, id ASC`
        : `SELECT * FROM editor_team WHERE site_id=$1 AND status='published' ORDER BY sort_order ASC, id ASC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team", detail: err.message });
  }
});

router.post("/:siteId/team", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name) return res.status(400).json({ error: "name is required" });
    const { rows } = await db.query(
      `INSERT INTO editor_team (site_id, name, role, bio, photo_url, social_url, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        siteId(req), b.name, b.role || null, b.bio || null, b.photo_url || null,
        b.social_url || null, Number(b.sort_order) || 0, b.status || "published",
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create team member", detail: err.message });
  }
});

router.patch("/:siteId/team/:id", async (req, res) => {
  try {
    const b = req.body || {};
    const { rows } = await db.query(
      `UPDATE editor_team SET
         name=COALESCE($3, name),
         role=COALESCE($4, role),
         bio=COALESCE($5, bio),
         photo_url=COALESCE($6, photo_url),
         social_url=COALESCE($7, social_url),
         sort_order=COALESCE($8, sort_order),
         status=COALESCE($9, status)
       WHERE site_id=$1 AND id=$2 RETURNING *`,
      [
        siteId(req), req.params.id,
        b.name ?? null, b.role ?? null, b.bio ?? null, b.photo_url ?? null,
        b.social_url ?? null,
        b.sort_order === undefined ? null : Number(b.sort_order), b.status ?? null,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Team member not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update team member", detail: err.message });
  }
});

router.delete("/:siteId/team/:id", async (req, res) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM editor_team WHERE site_id=$1 AND id=$2",
      [siteId(req), req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Team member not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete team member", detail: err.message });
  }
});

// ── Media upload (images + videos) ───────────────────────
function mediaDir(id) {
  return path.join(UPLOAD_ROOT, id);
}

function safeFilename(name) {
  const ext = path.extname(name || "").toLowerCase().slice(0, 8);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext || ".bin"}`;
}

router.post("/:siteId/upload", async (req, res) => {
  try {
    const id = siteId(req);
    const { filename, mime, data } = req.body || {};
    if (!data) return res.status(400).json({ error: "File data is required (base64)" });

    const allowed = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime))$/i;
    if (mime && !allowed.test(mime)) {
      return res.status(400).json({ error: "Only images (jpg/png/webp/gif) and videos (mp4/webm) allowed" });
    }

    const buffer = Buffer.from(data, "base64");
    if (buffer.length > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large (max 100MB)" });
    }

    const dir = mediaDir(id);
    fs.mkdirSync(dir, { recursive: true });
    const stored = safeFilename(filename);
    fs.writeFileSync(path.join(dir, stored), buffer);

    res.status(201).json({ url: `/api/media/${stored}`, filename: stored });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", detail: err.message });
  }
});

router.get("/:siteId/media/:filename", (req, res) => {
  try {
    const id = siteId(req);
    const file = path.join(mediaDir(id), path.basename(req.params.filename));
    if (!fs.existsSync(file)) return res.status(404).json({ error: "File not found" });
    res.sendFile(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to serve media", detail: err.message });
  }
});

module.exports = router;
