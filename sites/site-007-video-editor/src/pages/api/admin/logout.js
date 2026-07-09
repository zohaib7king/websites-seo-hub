import { clearSessionCookie } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  clearSessionCookie(res);
  return res.json({ ok: true });
}
