const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-007-video-editor";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const parts = req.query.path;
  const filename = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  if (!filename || filename.includes("..")) return res.status(400).json({ error: "Invalid path" });

  try {
    const upstream = await fetch(`${API}/api/video-editor/${SITE_ID}/media/${encodeURIComponent(filename)}`);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "File not found" });
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const type = upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ error: "Media proxy failed", detail: err.message });
  }
}
