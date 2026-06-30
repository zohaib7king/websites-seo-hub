// Shared helper to build fully-formed article objects from compact specs.
// Used by each site's site.config.js to seed >=5 dated articles so the site is
// always populated (fallback when the API/DB has no published content).

// Branded article artwork generated in-repo. This avoids generic stock or
// placeholder services while still giving each article a crawlable image.
export function seedImage(slug) {
  return `/article-image/${encodeURIComponent(slug)}.svg`;
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
    image_url: image === null ? null : (image || seedImage(slug)),
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
