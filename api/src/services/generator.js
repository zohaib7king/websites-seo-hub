// Article generation service.
// Shared by the POST /api/ai/generate route and the queue worker so the
// "keyword in → article row out" logic lives in exactly one place.
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

  "pet-care": (keyword) => `You are a veterinary content writer. Write an engaging, warm, SEO-optimized article about: "${keyword}" with practical tips for pet owners.
${structureSpec("Love your pet? Subscribe for more expert pet-care guides.")}`
};

// Generate one article from a keyword and persist it as a draft.
// Returns { article, raw }. Throws on failure; callers decide how to surface it.
// A missing site throws an error tagged with code "SITE_NOT_FOUND".
async function generateArticle(site_id, keyword) {
  const { rows: sites } = await db.query("SELECT * FROM sites WHERE id=$1", [site_id]);
  if (!sites[0]) {
    const err = new Error("Site not found");
    err.code = "SITE_NOT_FOUND";
    throw err;
  }

  const niche = sites[0].niche;
  const promptFn = NICHE_PROMPTS[niche] || NICHE_PROMPTS["artificial-intelligence"];

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: promptFn(keyword) }],
  });

  const raw = message.content[0].text.trim();
  const parsed = JSON.parse(raw);

  const slug = slugify(parsed.title, { lower: true, strict: true });
  const { rows } = await db.query(
    `INSERT INTO articles (site_id,title,slug,content,meta_desc,category,tags,status,ai_generated)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'draft',true) RETURNING *`,
    [site_id, parsed.title, slug, parsed.content, parsed.meta_desc, parsed.category, parsed.tags]
  );

  return { article: rows[0], raw: parsed };
}

module.exports = { generateArticle, NICHE_PROMPTS };
