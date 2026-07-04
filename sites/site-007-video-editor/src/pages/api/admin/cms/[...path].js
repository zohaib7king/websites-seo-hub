import { isAuthed } from "../../../../lib/adminAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-007-video-editor";

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parts = req.query.path;
  const path = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  const qs = new URL(req.url, "http://localhost").search;
  const url = `${API}/api/video-editor/${SITE_ID}/${path}${qs}`;

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body || {}),
    });
    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "CMS proxy failed", detail: err.message });
  }
}
