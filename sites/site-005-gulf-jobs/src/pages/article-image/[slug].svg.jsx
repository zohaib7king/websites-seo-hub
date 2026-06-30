import { SITE } from "../../site.config";

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

function articleSvg(article) {
  const slug = article?.slug || "gulf-jobs-guide";
  const hue = Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 70;
  const accent = hue % 2 ? "#0ea5e9" : "#7c3aed";
  const title = escapeSvg(shortText(article?.title || "Gulf Jobs Guide"));
  const category = escapeSvg(String(article?.category || "Gulf Jobs").toUpperCase());

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${title}">
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
  <text x="112" y="142" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" letter-spacing="4">${category}</text>
  <text x="112" y="318" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900">${title}</text>
  <text x="112" y="392" fill="#e0f2fe" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600">Practical Gulf career guide</text>
  <rect x="112" y="470" width="196" height="58" rx="29" fill="#ffffff"/>
  <text x="142" y="508" fill="#4c1d95" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900">Gulf Jobs Guide</text>
  <text x="914" y="528" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="900" opacity="0.82">GJ</text>
</svg>`;
}

export async function getServerSideProps({ params, res }) {
  const article = SITE.seedArticles.find(item => item.slug === params.slug);
  const svg = articleSvg(article);

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  res.write(svg);
  res.end();

  return { props: {} };
}

export default function ArticleImage() {
  return null;
}
