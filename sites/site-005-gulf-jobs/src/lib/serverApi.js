import { SITE } from "../site.config";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
export const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-005-gulf-jobs";

export async function proxyJson(req, res, path, body = req.body) {
  try {
    const response = await fetch(`${API}${path}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: req.method === "GET" ? undefined : JSON.stringify({ site_id: SITE_ID, ...body }),
    });
    const payload = await response.json().catch(() => ({}));
    res.status(response.status).json(payload);
  } catch (err) {
    res.status(500).json({ error: `Could not reach ${SITE.name} backend`, detail: err.message });
  }
}
