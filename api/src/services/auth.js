const crypto = require("crypto");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function secret() {
  return process.env.JWT_SECRET || "dev-only-change-me";
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function createToken(user) {
  const payload = base64url(JSON.stringify({
    sub: user.id,
    site_id: user.site_id,
    email: user.email,
    exp: Date.now() + TOKEN_TTL_MS,
  }));
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: "Login required" });
  req.user = user;
  next();
}

module.exports = {
  createToken,
  hashPassword,
  requireAuth,
  verifyPassword,
  verifyToken,
};
