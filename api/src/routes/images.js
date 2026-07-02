const express = require("express");
const multer = require("multer");
const { remakePhoto, bufferToDataUri, REPLICATE_MODEL } = require("../services/imageRemake");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const FACE_KEYS = ["A", "B", "C", "D", "E", "F", "G"];
const fields = upload.fields([
  { name: "source", maxCount: 1 },
  ...FACE_KEYS.map((key) => ({ name: `face${key}`, maxCount: 1 })),
]);

function collectFaces(files, order = FACE_KEYS) {
  return order
    .map((key) => files[`face${key}`])
    .filter(Boolean);
}

async function handleRemake(req, res, files) {
  try {
    const source = files.source;
    const faceOrder = Array.isArray(req.body?.face_order) ? req.body.face_order : FACE_KEYS;
    const faces = collectFaces(files, faceOrder);

    if (!source || faces.length === 0) {
      return res.status(400).json({ error: "source and at least one face image are required" });
    }

    const result = await remakePhoto({
      sourceBuffer: source.buffer,
      sourceMime: source.mimetype,
      faces: faces.map((face) => ({ buffer: face.buffer, mimetype: face.mimetype })),
    });

    const result_url = bufferToDataUri(result.buffer, result.mime || "image/jpeg");

    return res.json({
      mode: result.mode,
      result_url,
      message: result.message,
    });
  } catch (err) {
    console.error("[images/remake]", err.message);
    const status = err.code === "AI_NOT_CONFIGURED" ? 503
      : err.code === "DUPLICATE_REFERENCE" ? 400
      : 500;
    return res.status(status).json({
      error: err.code === "AI_NOT_CONFIGURED" ? "AI not configured" : err.code === "DUPLICATE_REFERENCE" ? "Duplicate portrait" : "Image remake failed",
      detail: err.message,
      code: err.code || "REMAKE_FAILED",
    });
  }
}

function parseDataUri(dataUri, fallbackMime = "image/jpeg") {
  const match = String(dataUri || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URI");
  return { buffer: Buffer.from(match[2], "base64"), mimetype: match[1] || fallbackMime };
}

// POST /api/images/remake-json — same as /remake but accepts base64 JSON (for site proxy)
router.post("/remake-json", async (req, res) => {
  try {
    const { source, faces = {}, face_order } = req.body || {};
    if (!source || !Object.keys(faces).length) {
      return res.status(400).json({ error: "source and at least one face are required" });
    }
    const parsedFaces = Object.fromEntries(
      FACE_KEYS
        .filter((key) => faces[key])
        .map((key) => [`face${key}`, parseDataUri(faces[key])])
    );
    const files = { source: parseDataUri(source), ...parsedFaces };
    req.body = { face_order };
    return handleRemake(req, res, files);
  } catch (err) {
    return res.status(400).json({ error: "Invalid image payload", detail: err.message });
  }
});

// POST /api/images/remake — childhood photo + reference face(s) -> remade image
router.post("/remake", (req, res) => {
  fields(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: "Upload failed", detail: uploadErr.message });
    }

    const source = req.files?.source?.[0];
    const faceFiles = Object.fromEntries(
      FACE_KEYS
        .map((key) => [`face${key}`, req.files?.[`face${key}`]?.[0]])
        .filter(([, value]) => value)
    );
    return handleRemake(req, res, { source, ...faceFiles });
  });
});

// GET /api/images/status — whether AI mode is available
router.get("/status", (_req, res) => {
  res.json({
    ai_enabled: !!process.env.REPLICATE_API_TOKEN,
    model: REPLICATE_MODEL,
  });
});

module.exports = router;
