import { isAuthed } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  return res.json({ ok: isAuthed(req) });
}
