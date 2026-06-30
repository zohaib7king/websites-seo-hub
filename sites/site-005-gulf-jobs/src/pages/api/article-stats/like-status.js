import { API, SITE_ID } from "../../../lib/serverApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const slug = String(req.query.slug || "").trim();
  if (!slug) return res.status(400).json({ error: "slug is required" });

  try {
    const response = await fetch(`${API}/api/articles/stats/like?site_id=${encodeURIComponent(SITE_ID)}&slug=${encodeURIComponent(slug)}`, {
      headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {},
    });
    const payload = await response.json().catch(() => ({}));
    res.status(response.status).json(payload);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch like status", detail: err.message });
  }
}
