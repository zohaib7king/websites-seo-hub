// Face-swap image remake — prefers free local open-source engine (InsightFace),
// with optional Replicate fallback when FACE_SWAP_PROVIDER=replicate.

const FACE_SWAP_URL = process.env.FACE_SWAP_URL || "http://face-swap:8080";
const FACE_SWAP_PROVIDER = process.env.FACE_SWAP_PROVIDER || "local";
const REPLICATE_MODEL_OWNER = "codeplugtech";
const REPLICATE_MODEL_NAME = "face-swap";
const REPLICATE_MODEL_VERSION = "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34";
const POLL_MS = 1500;
const MAX_POLLS = 120;
const LOCAL_MODEL = "insightface/inswapper_128";

function bufferToDataUri(buffer, mime = "image/jpeg") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLocalFaceSwap(targetBuffer, swapBuffer, targetMime, swapMime) {
  const form = new FormData();
  form.append("target_image", new Blob([targetBuffer], { type: targetMime || "image/jpeg" }), "target.jpg");
  form.append("swap_image", new Blob([swapBuffer], { type: swapMime || "image/jpeg" }), "swap.jpg");

  const res = await fetch(`${FACE_SWAP_URL}/swap`, { method: "POST", body: form });
  if (!res.ok) {
    let detail = "Local face swap failed";
    try {
      const payload = await res.json();
      detail = payload.detail || payload.error || detail;
    } catch {
      detail = await res.text().catch(() => detail);
    }
    const err = new Error(detail);
    err.code = "LOCAL_SWAP_FAILED";
    throw err;
  }

  return Buffer.from(await res.arrayBuffer());
}

async function runReplicateFaceSwap(token, targetBuffer, swapBuffer, mime = "image/jpeg") {
  const targetImage = bufferToDataUri(targetBuffer, mime);
  const swapImage = bufferToDataUri(swapBuffer, mime);

  const createRes = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL_OWNER}/${REPLICATE_MODEL_NAME}/versions/${REPLICATE_MODEL_VERSION}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        input_image: targetImage,
        swap_image: swapImage,
      },
    }),
  });

  const prediction = await createRes.json();
  if (!createRes.ok) {
    throw new Error(prediction.detail || prediction.error || "Replicate request failed");
  }

  let current = prediction;
  let polls = 0;
  while (current.status !== "succeeded" && current.status !== "failed" && current.status !== "canceled") {
    if (polls++ >= MAX_POLLS) throw new Error("Replicate timed out");
    await sleep(POLL_MS);
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${current.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    current = await pollRes.json();
    if (!pollRes.ok) throw new Error(current.detail || "Replicate poll failed");
  }

  if (current.status !== "succeeded") {
    throw new Error(current.error || `Replicate status: ${current.status}`);
  }

  const output = current.output;
  const url = Array.isArray(output) ? output[0] : output;
  if (!url) throw new Error("Replicate returned no image URL");

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error("Failed to download result image");
  return Buffer.from(await imgRes.arrayBuffer());
}

async function getLocalHealth() {
  try {
    const res = await fetch(`${FACE_SWAP_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false };
    const payload = await res.json();
    return { ok: !!payload.ok, engine: payload.engine || LOCAL_MODEL, paid: false };
  } catch {
    return { ok: false };
  }
}

async function getSwapStatus() {
  const local = await getLocalHealth();
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const allowReplicate = FACE_SWAP_PROVIDER === "replicate" || FACE_SWAP_PROVIDER === "auto";
  const provider = FACE_SWAP_PROVIDER === "replicate"
    ? "replicate"
    : local.ok
      ? "local-open-source"
      : allowReplicate && replicateToken
        ? "replicate-fallback"
        : "unavailable";

  return {
    ai_enabled: local.ok || (allowReplicate && !!replicateToken),
    ready: local.ok || (FACE_SWAP_PROVIDER === "replicate" && !!replicateToken),
    provider,
    model: local.ok ? LOCAL_MODEL : `${REPLICATE_MODEL_OWNER}/${REPLICATE_MODEL_NAME}:${REPLICATE_MODEL_VERSION}`,
    paid: provider === "replicate",
    message: local.ok
      ? "Free open-source face swap is active on this server."
      : FACE_SWAP_PROVIDER === "local"
        ? "Face swap engine is not ready yet. The open-source model may still be downloading on first server start."
        : replicateToken
          ? "Local engine is starting or unavailable; paid Replicate fallback may be used."
          : "Face swap engine is not ready yet.",
  };
}

function buffersMatch(a, b) {
  if (!a || !b) return false;
  return Buffer.compare(a, b) === 0;
}

async function swapOneFace(targetBuffer, targetMime, faceBuffer, faceMime) {
  const local = await getLocalHealth();
  const token = process.env.REPLICATE_API_TOKEN;
  const allowReplicate = FACE_SWAP_PROVIDER === "replicate" || FACE_SWAP_PROVIDER === "auto";

  if (local.ok) {
    return runLocalFaceSwap(targetBuffer, faceBuffer, targetMime, faceMime);
  }

  if (allowReplicate && token) {
    return runReplicateFaceSwap(token, targetBuffer, faceBuffer, targetMime || "image/jpeg");
  }

  const err = new Error("Free face swap is still starting. Wait 1-2 minutes after deploy, then try again.");
  err.code = "AI_NOT_READY";
  throw err;
}

async function remakePhoto({ sourceBuffer, sourceMime, faces = [] }) {
  const status = await getSwapStatus();
  if (!status.ai_enabled) {
    const err = new Error("Face swap is not ready yet. The open-source model may still be downloading on first server start.");
    err.code = "AI_NOT_READY";
    throw err;
  }

  const duplicate = faces.find((face) => buffersMatch(sourceBuffer, face.buffer));
  if (duplicate) {
    const err = new Error("One of the new portraits is identical to the old photo. Upload a different current face photo for each person.");
    err.code = "DUPLICATE_REFERENCE";
    throw err;
  }

  let working = sourceBuffer;
  let workingMime = sourceMime || "image/jpeg";

  for (const face of faces) {
    if (!face?.buffer) continue;
    working = await swapOneFace(working, workingMime, face.buffer, face.mimetype || "image/jpeg");
    workingMime = "image/jpeg";
  }

  return {
    mode: status.provider,
    buffer: working,
    mime: workingMime,
    message: status.paid
      ? "AI face swap complete using the paid fallback provider."
      : "AI face swap complete using the free open-source engine. Best results come from clear portraits and left-to-right face order.",
  };
}

module.exports = {
  remakePhoto,
  getSwapStatus,
  bufferToDataUri,
  LOCAL_MODEL,
};
