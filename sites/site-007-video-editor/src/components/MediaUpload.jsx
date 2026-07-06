import { useState } from "react";
import { uploadMediaFile } from "../lib/upload";

const boxStyle = {
  border: "1px dashed #94a3b8", borderRadius: 12, padding: 14,
  background: "#f8fafc", marginBottom: 8,
};

export default function MediaUpload({
  label,
  accept,
  value,
  onChange,
  hint,
  previewType = "image",
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setUploading(true);
    try {
      const url = await uploadMediaFile(file);
      onChange(url);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", color: "#475569", fontSize: 11, fontWeight: 700,
        marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase",
      }}>
        {label}
      </label>
      {hint && <p style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{hint}</p>}
      <div style={boxStyle}>
        <input type="file" accept={accept} onChange={onFile} disabled={uploading} />
        {uploading && <p style={{ color: "#0284c7", fontSize: 12, marginTop: 8 }}>Uploading…</p>}
        {err && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{err}</p>}
      </div>
      <input
        type="url"
        placeholder="Or paste image URL"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", background: "#fff", border: "1px solid #cbd5e1",
          borderRadius: 10, padding: "10px 12px", color: "#0f172a", fontSize: 14,
        }}
      />
      {value && previewType === "image" && (
        <img src={value} alt="Preview" style={{ width: "100%", maxWidth: 280, borderRadius: 10, marginTop: 10 }} />
      )}
      {value && previewType === "video" && value.startsWith("/api/media/") && (
        <video src={value} controls style={{ width: "100%", maxWidth: 360, borderRadius: 10, marginTop: 10 }} />
      )}
    </div>
  );
}
