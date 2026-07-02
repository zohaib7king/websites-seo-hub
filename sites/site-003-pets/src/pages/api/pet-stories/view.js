import { proxyJson } from "../../../lib/serverApi";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  return proxyJson(req, res, "/api/pet-stories/view");
}
