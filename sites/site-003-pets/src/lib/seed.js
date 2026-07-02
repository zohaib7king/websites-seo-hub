// Shared helper to build fully-formed article objects from compact specs.
export function seedImage(slug) {
  return `/article-image/${encodeURIComponent(slug)}`;
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
    data: data || null,
    status: "published",
    ai_generated: false,
    published_at: date,
    content: parts.join(""),
    view_count: 0,
    like_count: 0,
  };
}

export function makeStory({
  slug, title, category, date, excerpt, author = "Pet Historian",
  image, lead, sections = [], takeaway, conclusion,
}) {
  const parts = [];
  if (lead) parts.push(`<p>${lead}</p>`);
  if (takeaway) parts.push(`<blockquote><p>${takeaway}</p></blockquote>`);
  (sections || []).forEach((s) => {
    parts.push(`<h2>${s.h}</h2>`);
    (s.p || []).forEach((p) => parts.push(`<p>${p}</p>`));
    if (s.list) parts.push("<ul>" + s.list.map((li) => `<li>${li}</li>`).join("") + "</ul>");
  });
  if (conclusion) parts.push(`<h2>Final Thoughts</h2><p>${conclusion}</p>`);

  return {
    id: slug,
    slug,
    title,
    category,
    excerpt,
    image_url: image,
    author,
    published_at: date,
    content: parts.join(""),
    view_count: 0,
    like_count: 0,
  };
}

export function withArticleStats(article) {
  return {
    ...article,
    view_count: Number(article?.view_count ?? article?.views ?? 0),
    like_count: Number(article?.like_count ?? article?.likes ?? 0),
  };
}

export function byDateDesc(a, b) {
  return new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0);
}

export function byViewsDesc(a, b) {
  return Number(b.view_count || 0) - Number(a.view_count || 0);
}

export function readingTime(html) {
  const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatCount(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(number);
}
