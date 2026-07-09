import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";

// ── Module-scope components (stable identity across renders) ──────────────
// These used to live inside AIGenerator, which made React remount the <input>
// on every keystroke and steal focus. Lifting them out fixes that.

const Btn = ({ onClick, children, disabled, variant = "primary", style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "9px 18px", borderRadius: "var(--radius)", border: "none",
    fontWeight: 600, fontSize: 13, opacity: disabled ? 0.5 : 1, color: "#fff",
    background: variant === "primary" ? "var(--grad-accent)" : "var(--border)",
    boxShadow: variant === "primary" && !disabled ? "var(--glow)" : "none",
    ...style
  }}>{children}</button>
);

const Input = ({ value, onChange, placeholder, style = {} }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{
      background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
      padding: "9px 14px", color: "var(--text)", fontSize: 13, width: "100%", ...style
    }} />
);

const TabBtn = ({ name, label, tab, setTab }) => (
  <button onClick={() => setTab(name)} style={{
    padding: "8px 20px", borderRadius: "var(--radius)", border: "none",
    background: tab === name ? "var(--grad-accent)" : "var(--border)",
    color: tab === name ? "#fff" : "var(--text)", fontWeight: 600, fontSize: 13,
    boxShadow: tab === name ? "var(--glow)" : "none"
  }}>{label}</button>
);

const textareaStyle = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 12, color: "var(--text)",
  fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6
};

const selectStyle = {
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
  padding: "9px 14px", color: "var(--text)", fontSize: 13
};

// Sample-article picker used on both the Single and Bulk tabs: choose one of
// the site owner's saved samples, then optionally override how it's used
// (style/voice reference only, vs. source material to rework).
const SamplePicker = ({ samples, sampleId, setSampleId, sampleMode, setSampleMode, note }) => (
  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <select value={sampleId} onChange={e => setSampleId(e.target.value)} style={selectStyle}>
      <option value="">No sample — pure AI</option>
      {samples.map(s => (
        <option key={s.id} value={s.id}>
          {s.title} ({s.default_mode === "source_material" ? "source" : "style"})
        </option>
      ))}
    </select>
    {sampleId && (
      <select value={sampleMode} onChange={e => setSampleMode(e.target.value)} style={selectStyle}>
        <option value="">Use sample's default mode</option>
        <option value="style_reference">Style reference only</option>
        <option value="source_material">Rework as source material</option>
      </select>
    )}
    {note && <span style={{ color: "var(--muted)", fontSize: 11.5 }}>{note}</span>}
  </div>
);

// Build an article-writing prompt that follows Google's prompt-engineering
// best practices: an explicit Persona, Task, Context, and Format, plus tight
// constraints, an E-E-A-T quality bar, and a self-check step before answering.
function buildPrompt(topic, site) {
  const niche = (site?.niche || "general").replace(/-/g, " ");
  const siteName = site?.name || "our website";
  return `# ROLE / PERSONA
You are a senior SEO content writer and subject-matter expert in ${niche}. You write for "${siteName}", a publication that earns reader trust through accurate, genuinely useful content. Apply Google's E-E-A-T principles (Experience, Expertise, Authoritativeness, Trust).

# TASK
Write a complete, original, SEO-optimized article about: "${topic}"

# CONTEXT
- Audience: people searching Google for "${topic}" who want a clear, practical, trustworthy answer.
- Search intent: satisfy the query so fully that the reader does not need to return to the search results.
- The article is published on ${siteName} and monetized with display ads, so it must be skimmable and engaging.

# CONSTRAINTS & QUALITY BAR
- Length: 900–1100 words.
- Reading level: clear and accessible (~grade 7–8); explain any jargon in plain language.
- Structure: a strong intro that answers the core question in the first 2–3 sentences, then 3–5 <h2> sections (use <h3> for sub-points), and a short conclusion with a call to action.
- Include a "Frequently Asked Questions" <h2> with exactly 3 concise Q&As.
- Be specific: use concrete examples, steps, and numbers. Do NOT invent statistics or cite sources you are unsure about.
- Tone: helpful, confident, human — no filler or repetition.
- Use the topic and natural variations where they fit; do not keyword-stuff.

# OUTPUT FORMAT (STRICT)
Respond with ONLY valid JSON — no markdown code fences, no commentary — in exactly this shape:
{
  "title": "compelling, under 60 characters, includes the topic",
  "meta_desc": "under 155 characters, summarizes the article and invites the click",
  "category": "a single short category label",
  "tags": ["3-6", "lowercase", "topic", "tags"],
  "content": "the full article as clean HTML using only <h2>, <h3>, <p>, <ul>, <li>, <strong> — no <html>, <head>, or <body> wrappers"
}

# BEFORE YOU ANSWER
Silently verify: Does the JSON parse? Is "content" valid HTML? Did you fully answer "${topic}"? If anything is off, fix it, then output only the JSON object.`;
}

export default function AIGenerator() {
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("single"); // single | bulk | manual | samples

  // Manual (bring-your-own-LLM) state
  const [manualTopic, setManualTopic] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [manualOutput, setManualOutput] = useState("");
  const [manualSaved, setManualSaved] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sample-article library state (writer→critic→editor pipeline can reference
  // one of these per generation — see api/src/services/generator.js)
  const [samples, setSamples] = useState([]);
  const [sampleId, setSampleId] = useState("");
  const [sampleMode, setSampleMode] = useState("");
  const [bulkSampleId, setBulkSampleId] = useState("");
  const [bulkSampleMode, setBulkSampleMode] = useState("");
  const [newSampleTitle, setNewSampleTitle] = useState("");
  const [newSampleContent, setNewSampleContent] = useState("");
  const [newSampleDefaultMode, setNewSampleDefaultMode] = useState("style_reference");

  useEffect(() => {
    api.getSites().then(d => { setSites(d); if (d[0]) setSiteId(d[0].id); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!siteId) return;
    api.getSamples(siteId).then(setSamples).catch(() => {});
    setSampleId(""); setSampleMode(""); setBulkSampleId(""); setBulkSampleMode("");
  }, [siteId]);

  const currentSite = sites.find(s => s.id === siteId);

  async function addSample() {
    if (!siteId || !newSampleTitle.trim() || !newSampleContent.trim()) return;
    setLoading(true); setError(null);
    try {
      const saved = await api.createSample({
        site_id: siteId, title: newSampleTitle.trim(),
        content: newSampleContent.trim(), default_mode: newSampleDefaultMode,
      });
      setSamples([saved, ...samples]);
      setNewSampleTitle(""); setNewSampleContent("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function removeSample(id) {
    try {
      await api.deleteSample(id);
      setSamples(samples.filter(s => s.id !== id));
    } catch (e) { setError(e.message); }
  }

  async function generate() {
    if (!siteId || !keyword.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api.generateArticle(siteId, keyword.trim(), {
        sampleArticleId: sampleId || null, sampleMode: sampleMode || null,
      });
      setResult(data.article);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function bulkQueue() {
    const keywords = bulkText.split("\n").map(k => k.trim()).filter(Boolean);
    if (!keywords.length) return;
    setLoading(true);
    try {
      await api.bulkQueue(siteId, keywords, {
        sampleArticleId: bulkSampleId || null, sampleMode: bulkSampleMode || null,
      });
      alert(`✅ ${keywords.length} keywords added to queue!`);
      setBulkText("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function publish() {
    if (!result) return;
    await api.updateArticle(result.id, { status: "published" });
    setResult({ ...result, status: "published" });
  }

  // ── Manual flow ──────────────────────────────────────────────
  function makePrompt() {
    if (!manualTopic.trim()) return;
    setManualPrompt(buildPrompt(manualTopic.trim(), currentSite));
    setManualSaved(null); setError(null);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(manualPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard may be blocked; user can select manually */ }
  }

  async function saveManual() {
    setError(null); setManualSaved(null);
    let parsed;
    try {
      parsed = JSON.parse(manualOutput.trim());
    } catch {
      setError("Pasted text is not valid JSON. Paste exactly the { … } object the LLM returned.");
      return;
    }
    if (!parsed.title || !parsed.content) {
      setError("The JSON must include at least \"title\" and \"content\".");
      return;
    }
    setLoading(true);
    try {
      const article = await api.createArticle({
        site_id: siteId,
        title: parsed.title,
        content: parsed.content,
        meta_desc: parsed.meta_desc || "",
        category: parsed.category || "",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        status: "draft",
        ai_generated: true,
      });
      setManualSaved(article);
      setManualOutput("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>✨ AI Content Generator</h1>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>Generate articles with Claude — or bring your own LLM</p>
      </div>

      {/* Site Selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>TARGET SITE</label>
        <select value={siteId} onChange={e => setSiteId(e.target.value)} style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          padding: "9px 14px", color: "var(--text)", fontSize: 13, minWidth: 220
        }}>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <TabBtn name="single"  label="✨ Auto (Claude)"    tab={tab} setTab={setTab} />
        <TabBtn name="bulk"    label="📋 Bulk Queue"       tab={tab} setTab={setTab} />
        <TabBtn name="manual"  label="✍️ Manual Prompt"    tab={tab} setTab={setTab} />
        <TabBtn name="samples" label="📚 Sample Library"   tab={tab} setTab={setTab} />
      </div>

      {tab === "single" && (
        <div style={{ background: "var(--grad-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
          <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>KEYWORD / TOPIC</label>
          <div style={{ display: "flex", gap: 10 }}>
            <Input value={keyword} onChange={setKeyword} placeholder='e.g. "Best AI tools for small business 2025"' />
            <Btn onClick={generate} disabled={loading || !keyword.trim()} style={{ whiteSpace: "nowrap" }}>
              {loading ? "Writing → reviewing → editing..." : "Generate Article"}
            </Btn>
          </div>
          <SamplePicker samples={samples} sampleId={sampleId} setSampleId={setSampleId}
            sampleMode={sampleMode} setSampleMode={setSampleMode}
            note="Runs through a writer → critic → editor pipeline every time." />

          {error && (
            <div style={{ marginTop: 16, padding: 12, background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{result.title}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: result.status === "published" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                    color: result.status === "published" ? "var(--success)" : "var(--warning)"
                  }}>{result.status}</span>
                  {result.status !== "published" && (
                    <Btn onClick={publish} variant="secondary">Publish →</Btn>
                  )}
                </div>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>{result.meta_desc}</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Category: {result.category} · Tags: {(result.tags || []).join(", ")}
              </div>

              {result.review_notes && (
                <div style={{
                  marginTop: 12, padding: 12, borderRadius: "var(--radius)",
                  background: result.ai_review_passed ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                  border: `1px solid ${result.ai_review_passed ? "var(--success)" : "var(--warning)"}`
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: result.ai_review_passed ? "var(--success)" : "var(--warning)" }}>
                    {result.ai_review_passed ? "✓ Passed writer → critic → editor review" : "⚠ Editor left items unresolved — check before publishing"}
                  </div>
                  {result.review_notes.critique?.summary && (
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{result.review_notes.critique.summary}</div>
                  )}
                  {result.review_notes.unresolved_issues?.length > 0 && (
                    <ul style={{ margin: "6px 0 0 18px", fontSize: 12, color: "var(--muted)" }}>
                      {result.review_notes.unresolved_issues.map((iss, idx) => <li key={idx}>{iss}</li>)}
                    </ul>
                  )}
                </div>
              )}

              <div style={{
                marginTop: 16, padding: 16, background: "var(--bg)", borderRadius: "var(--radius)",
                maxHeight: 300, overflow: "auto", fontSize: 12, color: "var(--muted)",
                lineHeight: 1.8, fontFamily: "monospace"
              }}>
                {result.content?.substring(0, 800)}...
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "bulk" && (
        <div style={{ background: "var(--grad-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
          <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>
            KEYWORDS (one per line)
          </label>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)}
            rows={10} placeholder={"Best AI writing tools 2025\nChatGPT vs Gemini comparison\nHow to use AI for marketing\nFree AI image generators"}
            style={textareaStyle} />
          <SamplePicker samples={samples} sampleId={bulkSampleId} setSampleId={setBulkSampleId}
            sampleMode={bulkSampleMode} setSampleMode={setBulkSampleMode}
            note="Applies to every keyword in this batch — queue separately for a different sample." />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              {bulkText.split("\n").filter(k => k.trim()).length} keywords to queue
            </span>
            <Btn onClick={bulkQueue} disabled={loading || !bulkText.trim()}>
              {loading ? "Queuing..." : "Add to Queue"}
            </Btn>
          </div>
        </div>
      )}

      {tab === "manual" && (
        <div style={{ background: "var(--grad-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
          <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 16, lineHeight: 1.7 }}>
            No API key needed. Enter a topic, <strong style={{ color: "var(--text)" }}>copy the engineered prompt</strong>,
            run it in any LLM (ChatGPT, Gemini, Claude…), then paste the JSON it returns back here to save as a draft.
          </p>

          {/* Step 1: build prompt */}
          <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>① TOPIC</label>
          <div style={{ display: "flex", gap: 10 }}>
            <Input value={manualTopic} onChange={setManualTopic} placeholder='e.g. "How to start investing with $100"' />
            <Btn onClick={makePrompt} disabled={!manualTopic.trim()} style={{ whiteSpace: "nowrap" }}>Build Prompt</Btn>
          </div>

          {manualPrompt && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ color: "var(--muted)", fontSize: 12 }}>② ENGINEERED PROMPT — copy into your LLM</label>
                <Btn onClick={copyPrompt} variant="secondary" style={{ padding: "5px 12px", fontSize: 12 }}>
                  {copied ? "✓ Copied" : "Copy"}
                </Btn>
              </div>
              <textarea readOnly value={manualPrompt} rows={12} onFocus={e => e.target.select()}
                style={{ ...textareaStyle, fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }} />
            </div>
          )}

          {/* Step 2: paste output and save */}
          {manualPrompt && (
            <div style={{ marginTop: 18 }}>
              <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>
                ③ PASTE THE LLM'S JSON RESPONSE
              </label>
              <textarea value={manualOutput} onChange={e => setManualOutput(e.target.value)} rows={8}
                placeholder={'{\n  "title": "...",\n  "meta_desc": "...",\n  "category": "...",\n  "tags": ["..."],\n  "content": "<h2>...</h2><p>...</p>"\n}'}
                style={{ ...textareaStyle, fontFamily: "monospace", fontSize: 12 }} />
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                <Btn onClick={saveManual} disabled={loading || !manualOutput.trim()}>
                  {loading ? "Saving..." : "Save as Draft"}
                </Btn>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: 12, background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13 }}>
              ❌ {error}
            </div>
          )}
          {manualSaved && (
            <div style={{ marginTop: 16, padding: 12, background: "rgba(34,197,94,0.1)", borderRadius: "var(--radius)", color: "var(--success)", fontSize: 13 }}>
              ✅ Saved draft: <strong>{manualSaved.title}</strong> — find it in the Articles page.
            </div>
          )}
        </div>
      )}

      {tab === "samples" && (
        <div style={{ background: "var(--grad-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
          <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 16, lineHeight: 1.7 }}>
            Paste in articles you've written yourself for <strong style={{ color: "var(--text)" }}>{currentSite?.name || "this site"}</strong>.
            The writer stage can use them as a <strong style={{ color: "var(--text)" }}>style reference</strong> (matches your voice, writes something new)
            or as <strong style={{ color: "var(--text)" }}>source material</strong> (reworks/expands your piece). Pick per-generation on the Auto and Bulk tabs.
          </p>

          <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>TITLE</label>
          <Input value={newSampleTitle} onChange={setNewSampleTitle} placeholder='e.g. "How I picked my first index fund"' />

          <label style={{ display: "block", color: "var(--muted)", fontSize: 12, margin: "14px 0 6px" }}>YOUR ARTICLE TEXT</label>
          <textarea value={newSampleContent} onChange={e => setNewSampleContent(e.target.value)}
            rows={8} placeholder="Paste your article here..." style={textareaStyle} />

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <select value={newSampleDefaultMode} onChange={e => setNewSampleDefaultMode(e.target.value)} style={selectStyle}>
              <option value="style_reference">Default use: style reference only</option>
              <option value="source_material">Default use: source material to rework</option>
            </select>
            <Btn onClick={addSample} disabled={loading || !newSampleTitle.trim() || !newSampleContent.trim()}>
              {loading ? "Saving..." : "Save Sample"}
            </Btn>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: 12, background: "rgba(239,68,68,0.1)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <label style={{ display: "block", color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
              SAVED SAMPLES FOR THIS SITE ({samples.length})
            </label>
            {samples.length === 0 && (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>No samples yet — add one above.</div>
            )}
            {samples.map(s => (
              <div key={s.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius)", marginBottom: 8
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {s.default_mode === "source_material" ? "Source material" : "Style reference"} · {s.content.length} chars
                  </div>
                </div>
                <Btn onClick={() => removeSample(s.id)} variant="secondary" style={{ padding: "6px 12px", fontSize: 12 }}>Delete</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
