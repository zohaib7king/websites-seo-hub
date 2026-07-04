import { adminPassword, setSessionCookie } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const password = String(req.body?.password || "");
  if (password !== adminPassword()) {
    return res.status(401).json({ error: "Wrong password" });
  }
  setSessionCookie(res);
  return res.json({ ok: true });
}
