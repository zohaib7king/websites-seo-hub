// Article generation service.
// Shared by the POST /api/ai/generate route and the queue worker so the
// "keyword in → article row out" logic lives in exactly one place.
//
// Pipeline: WRITER drafts the article -> CRITIC reviews it (critique only,
// no rewriting) -> EDITOR applies the critique and produces the publish-ready
// version. Three separate Claude calls, each with a narrow job, so review
// notes are explicit and auditable (see articles.review_notes / ai_review_passed)
// instead of hidden inside one long "write a good article" prompt.
const Anthropic = require("@anthropic-ai/sdk");
const db = require("../db/pool");
const slugify = require("slugify");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Shared structural + formatting spec applied to every niche, so generated
// articles render well in the site's article template (lead paragraph, callout
// blockquotes, H2/H3 hierarchy, conclusion CTA).
function structureSpec(cta) {
  return `
STRUCTURE (follow exactly):
1. An opening LEAD paragraph (<p>) that hooks the reader and answers the core question in the first 2–3 sentences. Do NOT put a heading before it.
2. 3–4 main sections, each introduced by an <h2>. Use <h3> for sub-points where helpful.
3. At least ONE highlighted key takeaway as a <blockquote> (a single standout insight the reader must remember). Include 1–2 of these total.
4. Use <ul>/<ol> lists for steps or comparisons where natural.
5. A "Frequently Asked Questions" <h2> with exactly 3 concise Q&As (<h3> question, <p> answer).
6. A concluding <h2>Conclusion</h2> section that summarizes and ends with this call to action: "${cta}"

LENGTH: 900–1100 words. Be specific and practical; never invent statistics.

OUTPUT — respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "title": "compelling, under 60 characters, includes the topic",
  "meta_desc": "under 155 characters",
  "category": "a single short category label",
  "tags": ["3-6", "lowercase", "tags"],
  "content": "full article as clean HTML using ONLY <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong> — no <html>/<head>/<body> wrappers"
}`;
}

// Niche-specific prompts. Add a new niche by adding a key here.
const NICHE_PROMPTS = {
  "artificial-intelligence": (keyword) => `You are an expert AI journalist writing for "AI Insider Daily". Write a comprehensive, SEO-optimized, beginner-friendly but informative article about: "${keyword}". Cover what it is, why it matters, and practical use cases.
${structureSpec("Ready to explore more AI tools? Subscribe to AI Insider Daily.")}`,

  "personal-finance": (keyword) => `You are a trusted personal finance expert writing for "Finance Daily". Write a helpful, SEO-optimized article about: "${keyword}" with practical, actionable advice for everyday readers. Keep general tips approachable; no heavy disclaimers needed.
${structureSpec("Want more money tips? Subscribe to Finance Daily for weekly guides.")}`,

  "gulf-jobs": (keyword) => `You are a practical careers editor writing in English for "Gulf Jobs Guide", a content site for job seekers targeting the UAE, Saudi Arabia, Oman, Qatar, Kuwait, and Bahrain. Write a helpful, SEO-optimized article about: "${keyword}" for candidates across any field. Focus on realistic job search steps, CVs, interviews, LinkedIn and Gulf job portals, recruitment agencies, visa/work permit basics, documentation, and employer verification where relevant. Avoid guaranteed-job claims, illegal shortcuts, fake visa promises, invented salary statistics, and advice to pay unofficial agents or bypass official processes.
${structureSpec("Planning your Gulf job search? Read more practical guides from Gulf Jobs Guide.")}`,

  "pet-care": (keyword) => `You are a veterinary content writer. Write an engaging, warm, SEO-optimized article about: "${keyword}" with practical tips for pet owners.
${structureSpec("Love your pet? Subscribe for more expert pet-care guides.")}`
};

// ── Helpers ────────────────────────────────────────────────────────────────

// Claude sometimes wraps JSON in ```json fences despite instructions not to.
// Strip those defensively before parsing — with three chained calls instead
// of one, it's worth a little extra robustness.
function parseJSON(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function callClaude(prompt) {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });
  return parseJSON(message.content[0].text);
}

// Injects the site owner's own sample article into the writer prompt, either
// as a pure voice/style reference or as source material to rework. Since the
// sample is the owner's own original writing, "source_material" mode allows
// heavier reuse; "style_reference" mode explicitly forbids copying sentences.
function sampleSection(sample, mode) {
  if (!sample) return "";
  if (mode === "source_material") {
    return `\n\nSOURCE MATERIAL — the site owner's own original article, to rework for this piece:\n"""\n${sample.content}\n"""\nUse this as source material: rework, expand, and restructure it for the assigned keyword/angle above. Since it is the owner's own original content, reusing its ideas and facts is fine — but the output must still follow the STRUCTURE spec exactly and read as one complete, freshly composed article, not a pasted excerpt.`;
  }
  return `\n\nVOICE REFERENCE — the site owner's own writing (style only, not source material):\n"""\n${sample.content}\n"""\nStudy this sample only for voice, tone, sentence rhythm, and structural choices. Do NOT reuse its sentences, examples, or specific facts. Write a completely new article on the assigned keyword in this voice.`;
}

function buildCriticPrompt(keyword, niche, draft, sampleMode) {
  return `You are a strict content-quality critic reviewing an AI-written draft article before it can be published on a niche content site (${niche.replace(/-/g, " ")}). You do NOT rewrite anything — you only identify problems.

TARGET KEYWORD: "${keyword}"

DRAFT ARTICLE (JSON):
${JSON.stringify(draft, null, 2)}

CHECK FOR, IN ORDER OF IMPORTANCE:
1. Invented or unverifiable statistics, dates, prices, or claims presented as fact.
2. Weak E-E-A-T: generic filler that could apply to any topic, no concrete specifics/examples, no real point of view — versus genuinely useful, specific, experience-backed content.
3. Formulaic/templated feel: does this read like one of hundreds of interchangeable AI pages, or does it have a distinct angle on "${keyword}" specifically?
4. Structural compliance: lead paragraph present, 3-4 <h2> sections, at least one <blockquote> key takeaway, FAQ with exactly 3 Q&As, conclusion with CTA, 900-1100 words, only allowed HTML tags used.
5. Clarity, grammar, and natural flow; no keyword stuffing.
${sampleMode === "style_reference" ? "6. If any sentence or phrase appears to be copied near-verbatim from the voice-reference sample rather than freshly written, flag it." : ""}

Respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "pass": true or false (true only if there are zero medium/high severity issues),
  "issues": [ { "area": "string, e.g. 'invented stat' or 'structure'", "note": "specific, actionable description of the problem and where it is", "severity": "low" | "medium" | "high" } ],
  "summary": "one or two sentence overview of the draft's quality"
}`;
}

function buildEditorPrompt(keyword, draft, critique) {
  return `You are the final editor. Apply a critic's feedback to a draft article about "${keyword}" and produce the publish-ready version.

ORIGINAL DRAFT (JSON):
${JSON.stringify(draft, null, 2)}

CRITIC'S FEEDBACK (JSON):
${JSON.stringify(critique, null, 2)}

INSTRUCTIONS:
- Fix every issue listed, especially "medium" and "high" severity ones: remove/rephrase any invented statistics, add specificity where content was generic, sharpen the angle so it doesn't read as templated filler, and correct structure/grammar problems.
- Preserve everything that already works — do not rewrite parts the critic did not flag.
- Keep the same HTML tag constraints as the original draft (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong> only), 900-1100 words.
- If an issue genuinely cannot be resolved (e.g. it would require information you don't have), leave it in "unresolved_issues" instead of guessing or inventing facts to fill the gap.

Respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "title": "...",
  "meta_desc": "...",
  "category": "...",
  "tags": ["..."],
  "content": "...",
  "unresolved_issues": ["short description of any issue you could not fix — empty array if none"]
}`;
}

// Generate one article from a keyword and persist it as a draft.
// options: { sampleArticleId?, sampleMode? } — optional reference to a saved
// sample_articles row (see routes/samples.js) and an override for how it's
// used ("style_reference" | "source_material"); defaults to the sample's own
// default_mode when sampleMode isn't given.
// Returns { article, raw, review }. Throws on failure; callers decide how to
// surface it. A missing site throws an error tagged with code "SITE_NOT_FOUND".
async function generateArticle(site_id, keyword, options = {}) {
  const { rows: sites } = await db.query("SELECT * FROM sites WHERE id=$1", [site_id]);
  if (!sites[0]) {
    const err = new Error("Site not found");
    err.code = "SITE_NOT_FOUND";
    throw err;
  }

  const niche = sites[0].niche;
  const promptFn = NICHE_PROMPTS[niche] || NICHE_PROMPTS["artificial-intelligence"];

  let sample = null;
  if (options.sampleArticleId) {
    const { rows } = await db.query("SELECT * FROM sample_articles WHERE id=$1", [options.sampleArticleId]);
    sample = rows[0] || null;
  }
  const sampleMode = sample ? (options.sampleMode || sample.default_mode) : null;

  // Stage 1: WRITER — draft the article.
  const writerPrompt = promptFn(keyword) + sampleSection(sample, sampleMode);
  const draft = await callClaude(writerPrompt);

  // Stage 2: CRITIC — critique only, no rewriting.
  const critique = await callClaude(buildCriticPrompt(keyword, niche, draft, sampleMode));

  // Stage 3: EDITOR — apply the critique, produce the final publish-ready draft.
  const final = await callClaude(buildEditorPrompt(keyword, draft, critique));

  const unresolvedIssues = Array.isArray(final.unresolved_issues) ? final.unresolved_issues : [];
  const reviewNotes = { critique, unresolved_issues: unresolvedIssues };
  const passed = unresolvedIssues.length === 0;

  const slug = slugify(final.title, { lower: true, strict: true });
  const { rows } = await db.query(
    `INSERT INTO articles (site_id,title,slug,content,meta_desc,category,tags,status,ai_generated,review_notes,ai_review_passed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'draft',true,$8,$9) RETURNING *`,
    [site_id, final.title, slug, final.content, final.meta_desc, final.category, final.tags, reviewNotes, passed]
  );

  return { article: rows[0], raw: final, review: reviewNotes };
}

module.exports = { generateArticle, NICHE_PROMPTS };
