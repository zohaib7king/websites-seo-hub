const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";

export default async function handler(_req, res) {
  try {
    const upstream = await fetch(`${API}/api/images/status`);
    const payload = await upstream.json();
    return res.status(upstream.status).json(payload);
  } catch (err) {
    return res.status(500).json({ error: "Could not reach AI status", detail: err.message, ai_enabled: false });
  }
}
