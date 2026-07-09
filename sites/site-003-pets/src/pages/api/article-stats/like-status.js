import { proxyJson, SITE_ID } from "../../../lib/serverApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const slug = req.query.slug;
  return proxyJson(req, res, `/api/articles/stats/like?site_id=${encodeURIComponent(SITE_ID)}&slug=${encodeURIComponent(slug || "")}`, {});
}
