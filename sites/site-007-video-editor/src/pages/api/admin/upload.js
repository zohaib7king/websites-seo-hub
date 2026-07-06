import { isAuthed } from "../../../lib/adminAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-007-video-editor";

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const upstream = await fetch(`${API}/api/video-editor/${SITE_ID}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
    });
    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Upload proxy failed", detail: err.message });
  }
}
