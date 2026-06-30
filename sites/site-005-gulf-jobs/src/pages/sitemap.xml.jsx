import { getPublishedArticles, catSlug } from "../lib/data";
import { SITE } from "../site.config";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, priority = "0.7", changefreq = "weekly") {
  const lastmodTag = lastmod ? `<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : "";
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export async function getServerSideProps({ res }) {
  const baseUrl = `https://${SITE.domain}`;
  const articles = await getPublishedArticles();
  const categories = Array.from(new Set(articles.map(article => article.category).filter(Boolean)));
  const now = new Date().toISOString();

  const urls = [
    urlEntry(baseUrl, now, "1.0", "daily"),
    urlEntry(`${baseUrl}/cv-maker`, now, "0.95", "weekly"),
    urlEntry(`${baseUrl}/contact`, now, "0.4", "yearly"),
    urlEntry(`${baseUrl}/privacy`, now, "0.3", "yearly"),
    ...categories.map(category => urlEntry(`${baseUrl}/category/${catSlug(category)}`, now, "0.75", "weekly")),
    ...articles.map(article => urlEntry(`${baseUrl}/article/${article.slug}`, article.published_at, "0.8", "monthly")),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
