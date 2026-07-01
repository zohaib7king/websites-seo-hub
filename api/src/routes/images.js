const express = require("express");
const multer = require("multer");
const { remakePhoto, bufferToDataUri } = require("../services/imageRemake");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const fields = upload.fields([
  { name: "source", maxCount: 1 },
  { name: "face1", maxCount: 1 },
  { name: "face2", maxCount: 1 },
]);

async function handleRemake(req, res, files) {
  try {
    const source = files.source;
    const face1 = files.face1;
    const face2 = files.face2;
    const faceOrder = req.body?.face_order || "face1-first";

    if (!source || !face1) {
      return res.status(400).json({ error: "source and face1 images are required" });
    }

    const firstFace = faceOrder === "face2-first" && face2 ? face2 : face1;
    const secondFace = faceOrder === "face2-first" ? face1 : face2;

    const result = await remakePhoto({
      sourceBuffer: source.buffer,
      face1Buffer: firstFace.buffer,
      face2Buffer: secondFace?.buffer,
      sourceMime: source.mimetype,
      face1Mime: firstFace.mimetype,
      face2Mime: secondFace?.mimetype,
    });

    const result_url = bufferToDataUri(result.buffer, result.mime || "image/jpeg");

    return res.json({
      mode: result.mode,
      result_url,
      message: result.message,
    });
  } catch (err) {
    console.error("[images/remake]", err.message);
    return res.status(500).json({ error: "Image remake failed", detail: err.message });
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
    const { source, face1, face2, face_order } = req.body || {};
    if (!source || !face1) {
      return res.status(400).json({ error: "source and face1 are required" });
    }
    const files = {
      source: parseDataUri(source),
      face1: parseDataUri(face1),
      face2: face2 ? parseDataUri(face2) : null,
    };
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
    const face1 = req.files?.face1?.[0];
    const face2 = req.files?.face2?.[0];
    return handleRemake(req, res, { source, face1, face2 });
  });
});

// GET /api/images/status — whether AI mode is available
router.get("/status", (_req, res) => {
  res.json({
    ai_enabled: !!process.env.REPLICATE_API_TOKEN,
    model: "lucataco/faceswap",
  });
});

module.exports = router;
