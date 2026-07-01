import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

function UploadBox({ label, hint, file, onChange, preview }) {
  return (
    <label style={{ display: "block", cursor: "pointer" }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{label}</span>
      <div style={{
        border: "2px dashed var(--border)", borderRadius: 18, padding: 16, minHeight: 160,
        background: "color-mix(in srgb,var(--surface) 90%,#fff)", textAlign: "center",
      }}>
        {preview ? (
          <img src={preview} alt={label} style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 12, marginBottom: 10 }} />
        ) : (
          <div style={{ color: "var(--muted)", fontSize: 14, padding: "36px 12px" }}>{hint}</div>
        )}
        <span className="memory-btn memory-btn-soft" style={{ display: "inline-flex", fontSize: 13 }}>{file ? "Change file" : "Choose image"}</span>
      </div>
      <input type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

function readFile(file, setter) {
  if (!file) {
    setter(null);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => setter({ file, preview: reader.result });
  reader.readAsDataURL(file);
}

export default function PhotoRemake({ theme }) {
  const [source, setSource] = useState(null);
  const [face1, setFace1] = useState(null);
  const [face2, setFace2] = useState(null);
  const [faceOrder, setFaceOrder] = useState("face1-first");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canGenerate = useMemo(() => source?.file && face1?.file, [source, face1]);

  useEffect(() => () => {
    if (result?.resultUrl?.startsWith("blob:")) URL.revokeObjectURL(result.resultUrl);
  }, [result]);

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/remake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source.preview,
          face1: face1.preview,
          face2: face2?.preview || null,
          face_order: faceOrder,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || payload.detail || "Generation failed");

      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result?.result_url) return;
    const link = document.createElement("a");
    link.href = result.result_url;
    link.download = "remake-memory.jpg";
    link.click();
  };

  return (
    <Layout
      title="Photo Remake Tool"
      description="Upload a childhood photo and current face portraits to generate an updated memory image."
      theme={theme}
      canonical={`https://${SITE.domain}/photo-remake`}
    >
      <section style={{ marginBottom: 24 }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Photo Remake</span>
        <h1 className="hero-title" style={{ fontSize: 38, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 10px" }}>
          Recreate your childhood photo
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75, maxWidth: 720 }}>
          Upload the old image, add today's face photos, then generate a before/after remake. For two children, add a second reference portrait and choose the swap order.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }} className="feature-split">
        <UploadBox
          label="1. Old childhood photo"
          hint="Drop your childhood or family photo here"
          file={source?.file}
          preview={source?.preview}
          onChange={(e) => readFile(e.target.files?.[0], setSource)}
        />
        <div style={{ display: "grid", gap: 14 }}>
          <UploadBox
            label="2. Current face — person A"
            hint="Clear front-facing portrait"
            file={face1?.file}
            preview={face1?.preview}
            onChange={(e) => readFile(e.target.files?.[0], setFace1)}
          />
          <UploadBox
            label="3. Current face — person B (optional)"
            hint="Second child or sibling portrait"
            file={face2?.file}
            preview={face2?.preview}
            onChange={(e) => readFile(e.target.files?.[0], setFace2)}
          />
        </div>
      </div>

      {face2?.file && (
        <div style={{ marginBottom: 18, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", display: "block", marginBottom: 8 }}>Two-face swap order</label>
          <select value={faceOrder} onChange={(e) => setFaceOrder(e.target.value)} style={{ width: "100%", maxWidth: 420, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}>
            <option value="face1-first">Swap person A first, then person B</option>
            <option value="face2-first">Swap person B first, then person A</option>
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 22 }}>
        <button type="button" onClick={generate} disabled={!canGenerate || loading} className="memory-btn memory-btn-primary" style={{ opacity: !canGenerate || loading ? 0.6 : 1 }}>
          {loading ? "Generating..." : "Generate Remake"}
        </button>
        {result?.mode === "demo" && (
          <span style={{ color: "var(--accent2)", fontSize: 13, fontWeight: 700 }}>
            Demo mode — add REPLICATE_API_TOKEN for real AI face swap
          </span>
        )}
      </div>

      {error && <p style={{ color: "#f87171", marginBottom: 18, fontWeight: 700 }}>{error}</p>}

      {(source?.preview || result?.result_url) && (
        <section className="glass-panel" style={{ borderRadius: 24, padding: 22 }}>
          <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 16 }}>Before & after</h2>
          <div className="compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Before</div>
              <img src={source?.preview} alt="Before" className="before-shot" style={{ width: "100%", borderRadius: 16, border: "1px solid var(--border)" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>After</div>
              {result?.result_url ? (
                <img src={result.result_url} alt="After remake" style={{ width: "100%", borderRadius: 16, border: "1px solid var(--border)" }} />
              ) : (
                <div style={{ minHeight: 220, borderRadius: 16, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 14 }}>
                  Your remake will appear here
                </div>
              )}
            </div>
          </div>
          {result?.result_url && (
            <button type="button" onClick={download} className="memory-btn memory-btn-soft" style={{ marginTop: 16 }}>
              Download result
            </button>
          )}
          {result?.message && <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>{result.message}</p>}
        </section>
      )}
    </Layout>
  );
}
