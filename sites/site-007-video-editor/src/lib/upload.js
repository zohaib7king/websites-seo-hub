export async function uploadMediaFile(file) {
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === "string" ? result.split(",")[1] : "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mime: file.type, data }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || body.detail || "Upload failed");
  return body.url;
}

export function isYoutubeUrl(url) {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

export function isUploadedMedia(url) {
  if (!url) return false;
  return url.startsWith("/api/media/");
}
