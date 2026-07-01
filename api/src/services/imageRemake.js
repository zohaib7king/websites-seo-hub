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
 * Demo fallback: return the source with a note when Replicate is not configured.
 */
function demoResult(sourceBuffer, mime) {
  return {
    mode: "demo",
    buffer: sourceBuffer,
    mime,
    message: "Demo mode is active. Set REPLICATE_API_TOKEN in .env for real AI face swapping.",
  };
}

/**
 * Remake a childhood photo by swapping one or two reference faces.
 */
async function remakePhoto({ sourceBuffer, face1Buffer, face2Buffer, sourceMime, face1Mime, face2Mime }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return demoResult(sourceBuffer, sourceMime || "image/jpeg");

  let working = sourceBuffer;
  let workingMime = sourceMime || "image/jpeg";

  working = await runFaceSwap(token, working, face1Buffer, face1Mime || "image/jpeg");
  workingMime = "image/jpeg";

  if (face2Buffer) {
    working = await runFaceSwap(token, working, face2Buffer, face2Mime || "image/jpeg");
  }

  return {
    mode: "ai",
    buffer: working,
    mime: workingMime,
    message: "AI face swap complete. Results vary with photo quality and lighting.",
  };
}

module.exports = { remakePhoto, bufferToDataUri, downloadToBuffer };
