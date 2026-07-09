// Single-page SEO extraction for the live Gulf Jobs article.
const URL = "https://gulfjobss.com/article/how-to-use-linkedin-and-gulf-job-portals";
const res = await fetch(URL, { redirect: "follow" });
const html = await res.text();
const pick = (re) => { const m = html.match(re); return m ? m[1].trim() : null; };
const all = (re) => { const o = []; let m; while ((m = re.exec(html))) o.push(m[1]); return o; };

const title = pick(/<title>([^<]*)<\/title>/i);
const metaDesc = pick(/<meta name="description" content="([^"]*)"/i);
const robots = pick(/<meta name="robots" content="([^"]*)"/i);
const canonical = pick(/<link rel="canonical" href="([^"]*)"/i);
const og = {
  title: pick(/property="og:title" content="([^"]*)"/i),
  desc: pick(/property="og:description" content="([^"]*)"/i),
  image: pick(/property="og:image" content="([^"]*)"/i),
  url: pick(/property="og:url" content="([^"]*)"/i),
  type: pick(/property="og:type" content="([^"]*)"/i),
};
const tw = {
  card: pick(/name="twitter:card" content="([^"]*)"/i),
  title: pick(/name="twitter:title" content="([^"]*)"/i),
};
const h1 = all(/<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(s => s.replace(/<[^>]+>/g, "").trim());
const h2 = all(/<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(s => s.replace(/<[^>]+>/g, "").trim());
const h3 = all(/<h3[^>]*>([\s\S]*?)<\/h3>/gi).map(s => s.replace(/<[^>]+>/g, "").trim());

// Schema
const ld = all(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
let schemaTypes = [];
for (const block of ld) {
  try {
    const j = JSON.parse(block);
    const arr = Array.isArray(j) ? j : [j];
    for (const o of arr) if (o["@type"]) schemaTypes.push(o["@type"]);
  } catch { schemaTypes.push("(unparseable)"); }
}

// Links (rough): internal = href="/..." ; external = href="http..."
const hrefs = all(/href="([^"]+)"/gi);
const internal = hrefs.filter(h => h.startsWith("/")).length;
const external = hrefs.filter(h => /^https?:\/\//.test(h) && !h.includes("gulfjobss.com")).length;
// Internal links inside the article body (contextual) — count links within <div class="article-body">
const bodyMatch = html.match(/article-body[^>]*>([\s\S]*?)<\/article>/i);
const bodyHtml = bodyMatch ? bodyMatch[1] : "";
const bodyInternalLinks = (bodyHtml.match(/href="\/[^"]*"/g) || []).length;
const bodyWords = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

// Images
const imgs = all(/<img\b[^>]*>/gi);
const images = (html.match(/<img\b[^>]*>/gi) || []).map(tag => ({
  src: (tag.match(/src="([^"]*)"/) || [])[1] || "",
  alt: (tag.match(/alt="([^"]*)"/) || [])[1],
  hasAlt: /alt="/.test(tag),
}));

console.log(JSON.stringify({
  http: res.status,
  title, titleLen: title?.length,
  metaDesc, metaDescLen: metaDesc?.length,
  robots, canonical, og, tw,
  h1Count: h1.length, h1, h2Count: h2.length, h2, h3Count: h3.length,
  schemaTypes,
  links: { internalTotal: internal, externalTotal: external, contextualInBody: bodyInternalLinks },
  bodyWords,
  images: images.map(i => ({ src: i.src.slice(0, 70), hasAlt: i.hasAlt, alt: i.alt?.slice(0, 60) })),
}, null, 2));
