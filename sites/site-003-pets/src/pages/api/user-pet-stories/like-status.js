import { proxyJson, SITE_ID } from "../../../lib/serverApi";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const id = req.query.id;
  return proxyJson(req, res, `/api/user-pet-stories/like-status?site_id=${encodeURIComponent(SITE_ID)}&id=${encodeURIComponent(id || "")}`, {});
}
