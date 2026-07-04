import crypto from "crypto";

const COOKIE = "ff_admin_session";

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "frameforge-admin-secret";
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function sessionToken() {
  return crypto.createHmac("sha256", secret()).update(adminPassword()).digest("hex");
}

export function isAuthed(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return false;
  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  return value === sessionToken();
}

export function setSessionCookie(res) {
  const token = sessionToken();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`
  );
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export { COOKIE };
