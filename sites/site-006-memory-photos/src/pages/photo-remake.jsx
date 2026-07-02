import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

const FACE_KEYS = ["A", "B", "C", "D", "E", "F", "G"];

function UploadBox({ label, hint, file, onChange, preview, badge }) {
  return (
    <label style={{ display: "block", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {badge ? (
          <span style={{ width: 26, height: 26, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--hero)", color: "#fff", fontSize: 12, fontWeight: 900 }}>
            {badge}
          </span>
        ) : null}
        <span style={{ display: "block", fontSize: 12, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      </div>
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

function emptyFaceMap() {
  return Object.fromEntries(FACE_KEYS.map((key) => [key, null]));
}

export default function PhotoRemake({ theme }) {
  const [source, setSource] = useState(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [faces, setFaces] = useState(emptyFaceMap);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(null);

  const activeKeys = useMemo(() => FACE_KEYS.slice(0, peopleCount), [peopleCount]);
  const uploadedFaces = useMemo(() => activeKeys.filter((key) => faces[key]?.file), [activeKeys, faces]);
  const duplicateKeys = useMemo(() => (
    activeKeys.filter((key) => faces[key]?.preview && source?.preview && faces[key].preview === source.preview)
  ), [activeKeys, faces, source]);
  const canGenerate = useMemo(
    () => source?.file && uploadedFaces.length === peopleCount && duplicateKeys.length === 0 && aiEnabled === true,
    [source, uploadedFaces.length, peopleCount, duplicateKeys.length, aiEnabled]
  );

  useEffect(() => {
    fetch("/api/ai-status")
      .then((res) => res.json())
      .then((data) => setAiEnabled(!!data.ai_enabled))
      .catch(() => setAiEnabled(false));
  }, []);

  const setFace = (key, file) => {
    readFile(file, (value) => {
      setFaces((current) => ({ ...current, [key]: value }));
    });
  };

  const generate = async () => {
    if (!canGenerate) {
      if (aiEnabled === false) {
        setError("Real AI remake is not active yet. The server needs REPLICATE_API_TOKEN before it can replace faces.");
      } else if (duplicateKeys.length) {
        setError("A new portrait matches the old photo. Upload a different current face photo for each person.");
      } else if (uploadedFaces.length < peopleCount) {
        setError(`Please upload all ${peopleCount} current portrait${peopleCount > 1 ? "s" : ""} before generating.`);
      }
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/remake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source.preview,
          faces: Object.fromEntries(
            activeKeys
              .filter((key) => faces[key]?.preview)
              .map((key) => [key, faces[key].preview])
          ),
          face_order: activeKeys,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.detail || payload.error || "Generation failed");

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
      description="Upload an old photo, choose how many people are in it, and add new portraits for A-G face replacements."
      theme={theme}
      canonical={`https://${SITE.domain}/photo-remake`}
    >
      {aiEnabled === false && (
        <section style={{
          marginBottom: 20, borderRadius: 20, padding: "18px 20px",
          background: "color-mix(in srgb, #ef4444 14%, var(--surface))",
          border: "1px solid color-mix(in srgb, #ef4444 35%, var(--border))",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, color: "#fecaca" }}>AI remake is not active on the server</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
            Right now the tool cannot replace faces yet. Without <strong>REPLICATE_API_TOKEN</strong> on the server, it would only return the same old image. Add the token, rebuild the API, then upload a <strong>different new portrait</strong> for each person.
          </p>
        </section>
      )}

      <section className="glass-panel" style={{ marginBottom: 24, borderRadius: 30, padding: "30px 24px" }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Photo Remake Studio</span>
        <h1 className="hero-title" style={{ fontSize: 42, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 10px" }}>
          Replace every person in the old photo, one by one
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75, maxWidth: 720 }}>
          Set how many people are visible in the original image, then upload one clear current photo for each person. People are processed in left-to-right order as <strong>A, B, C, D, E, F, G</strong>.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 20 }}>
          {[
            ["1", "Choose people count first"],
            ["2", "Upload old photo + all new portraits"],
            ["3", "Faces should match left-to-right order"],
          ].map(([num, text]) => (
            <div key={num} style={{ border: "1px solid var(--border)", borderRadius: 18, padding: 16, background: "color-mix(in srgb,var(--surface) 88%,#fff)" }}>
              <div style={{ color: "var(--accent)", fontWeight: 950, fontSize: 22, lineHeight: 1, marginBottom: 8 }}>{num}</div>
              <div style={{ color: "var(--muted)", fontSize: 14 }}>{text}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 18, marginBottom: 18 }} className="feature-split">
        <UploadBox
          label="OLD photo — childhood / original image"
          hint="Upload the old family photo you want to recreate."
          file={source?.file}
          preview={source?.preview}
          onChange={(e) => readFile(e.target.files?.[0], setSource)}
        />
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
              How many people are in the old photo?
            </label>
            <select
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
            >
              {FACE_KEYS.map((key, index) => (
                <option key={key} value={index + 1}>{index + 1} person{index ? "s" : ""}</option>
              ))}
            </select>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
              The tool will show upload boxes for {peopleCount} people and apply them in order: {activeKeys.join(", ")}.
            </p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Reference order</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
              If the old photo has three people from left to right, upload their new photos as <strong>A</strong>, <strong>B</strong>, then <strong>C</strong>. This gives the AI the best chance of matching the right person.
            </p>
          </div>
        </div>
      </div>

      <section style={{ marginBottom: 22, background: "linear-gradient(135deg, color-mix(in srgb,var(--surface) 95%,#fff), color-mix(in srgb,var(--accent) 7%, var(--surface)))", border: "1px solid var(--border)", borderRadius: 24, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 950 }}>NEW portraits — one per person today</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
              Do <strong>not</strong> upload the old photo again here. Each box needs a different current face photo.
            </p>
          </div>
          <div style={{ color: "var(--accent2)", fontSize: 13, fontWeight: 800 }}>
            Uploaded: {uploadedFaces.length}/{peopleCount}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {activeKeys.map((key, index) => (
            <UploadBox
              key={key}
              badge={key}
              label={`Person ${key} — NEW current face`}
              hint={`Upload today's portrait for person ${key}. Must be different from the old photo.`}
              file={faces[key]?.file}
              preview={faces[key]?.preview}
              onChange={(e) => setFace(key, e.target.files?.[0])}
            />
          ))}
        </div>
        {duplicateKeys.length > 0 && (
          <p style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginTop: 14 }}>
            Person {duplicateKeys.join(", ")} uses the same image as the old photo. Upload a different new portrait.
          </p>
        )}
      </section>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 22 }}>
        <button type="button" onClick={generate} disabled={!canGenerate || loading} className="memory-btn memory-btn-primary" style={{ opacity: !canGenerate || loading ? 0.6 : 1 }}>
          {loading ? "Generating..." : aiEnabled === false ? "AI Not Ready" : "Generate Remake"}
        </button>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {aiEnabled === false
            ? "Server AI token missing — real face swap cannot run yet."
            : "Upload the old photo once, then upload different new portraits for A, B, C..."}
        </span>
      </div>

      {error && <p style={{ color: "#f87171", marginBottom: 18, fontWeight: 700 }}>{error}</p>}

      <section style={{ marginBottom: 22, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Before you click generate</h2>
        <ul style={{ color: "var(--muted)", paddingLeft: 20, lineHeight: 1.9, fontSize: 14 }}>
          <li>Upload the <strong>old photo only once</strong> in the first box.</li>
          <li>Each person needs a <strong>different new portrait</strong> from today — not the childhood photo again.</li>
          <li>Current portraits should be front-facing, well lit, and without sunglasses.</li>
          <li>Match left-to-right order: first person in the old photo = A, second = B, and so on.</li>
        </ul>
      </section>

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
