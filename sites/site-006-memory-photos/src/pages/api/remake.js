const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch(`${API}/api/images/remake-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const payload = await upstream.json();
    return res.status(upstream.status).json(payload);
  } catch (err) {
    return res.status(500).json({ error: "Proxy failed", detail: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
};
