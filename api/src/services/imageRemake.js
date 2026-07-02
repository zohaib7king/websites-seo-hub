// Face-swap image remake via Replicate (with demo fallback when no API token).

const REPLICATE_MODEL = "lucataco/faceswap";
const POLL_MS = 1500;
const MAX_POLLS = 120;

function bufferToDataUri(buffer, mime = "image/jpeg") {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFaceSwap(token, targetBuffer, swapBuffer, mime = "image/jpeg") {
  const targetImage = bufferToDataUri(targetBuffer, mime);
  const swapImage = bufferToDataUri(swapBuffer, mime);

  const createRes = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        target_image: targetImage,
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

async function downloadToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch image");
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Remake a childhood photo by swapping a left-to-right ordered list of faces.
 * This is still model-limited: the underlying provider does not let us pin
 * exact bounding boxes, so the best approximation is to apply replacements in
 * the same order the user sees people in the original image.
 */
function buffersMatch(a, b) {
  if (!a || !b) return false;
  return Buffer.compare(a, b) === 0;
}

async function remakePhoto({ sourceBuffer, sourceMime, faces = [] }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    const err = new Error("AI face swap is not configured on the server. Add REPLICATE_API_TOKEN to enable real remakes.");
    err.code = "AI_NOT_CONFIGURED";
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
    working = await runFaceSwap(token, working, face.buffer, face.mimetype || "image/jpeg");
    workingMime = "image/jpeg";
  }

  return {
    mode: "ai",
    buffer: working,
    mime: workingMime,
    message: "AI face swap complete. Best results come from clear left-to-right mapping, front-facing portraits, and uncluttered original photos.",
  };
}

module.exports = { remakePhoto, bufferToDataUri, downloadToBuffer };
