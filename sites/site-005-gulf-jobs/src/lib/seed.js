// Shared helper to build fully-formed article objects from compact specs.
// Used by each site's site.config.js to seed >=5 dated articles so the site is
// always populated (fallback when the API/DB has no published content).

function escapeSvg(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortText(value, max = 58) {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

// Branded article artwork generated in-repo. This avoids generic stock or
// placeholder services while still giving each article a crawlable image.
export function seedImage(slug, title, category) {
  const hue = Array.from(String(slug || "")).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 70;
  const accent = hue % 2 ? "#0ea5e9" : "#7c3aed";
  const safeTitle = escapeSvg(shortText(title));
  const safeCategory = escapeSvg(String(category || "Gulf Jobs").toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4c1d95"/>
      <stop offset="0.55" stop-color="${accent}"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="glow" cx="75%" cy="18%" r="62%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#glow)"/>
  <circle cx="1030" cy="95" r="150" fill="#ffffff" opacity="0.11"/>
  <circle cx="114" cy="579" r="210" fill="#ffffff" opacity="0.09"/>
  <rect x="80" y="76" width="1040" height="523" rx="38" fill="#ffffff" opacity="0.11" stroke="#ffffff" stroke-opacity="0.28"/>
  <text x="112" y="142" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" letter-spacing="4">${safeCategory}</text>
  <text x="112" y="318" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900">${safeTitle}</text>
  <text x="112" y="392" fill="#e0f2fe" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600">Practical Gulf career guide</text>
  <rect x="112" y="470" width="196" height="58" rx="29" fill="#ffffff"/>
  <text x="142" y="508" fill="#4c1d95" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900">Gulf Jobs Guide</text>
  <text x="914" y="528" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="900" opacity="0.82">GJ</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function makeArticle({
  slug, title, category, date, excerpt, author = "Editorial Team",
  image, tags = [], lead, sections = [], takeaway, data, conclusion,
}) {
  const parts = [];
  if (lead) parts.push(`<p>${lead}</p>`);
  if (takeaway) parts.push(`<blockquote><p>${takeaway}</p></blockquote>`);
  (sections || []).forEach((s) => {
    parts.push(`<h2>${s.h}</h2>`);
    (s.p || []).forEach((p) => parts.push(`<p>${p}</p>`));
    if (s.list) parts.push("<ul>" + s.list.map((li) => `<li>${li}</li>`).join("") + "</ul>");
  });
  if (conclusion) parts.push(`<h2>The Bottom Line</h2><p>${conclusion}</p>`);

  return {
    id: slug,
    slug,
    title,
    category,
    meta_desc: excerpt,
    image_url: image === null ? null : (image || seedImage(slug, title, category)),
    tags,
    author,
    data: data || null, // optional headline stat for the article callout
    status: "published",
    ai_generated: false,
    published_at: date,
    content: parts.join(""),
  };
}

// Sort newest-first; tolerates missing dates.
export function byDateDesc(a, b) {
  return new Date(b.published_at || 0) - new Date(a.published_at || 0);
}

export function readingTime(html) {
  const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
