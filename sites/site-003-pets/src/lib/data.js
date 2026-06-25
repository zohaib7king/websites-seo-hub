// Server-side data helpers used by getServerSideProps.
// NEXT_PUBLIC_* are inlined at build time via docker-compose build.args.
import { SITE } from "../site.config";
import { byDateDesc } from "./seed";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID;

export async function getSite() {
  try {
    const res = await fetch(`${API}/api/sites/${SITE_ID}`);
    if (res.ok) {
      const s = await res.json();
      if (s) return { ...s, theme: s.theme || SITE.defaultTheme || "midnight" };
    }
  } catch { /* fall through */ }
  // Fallback so the site renders (and looks on-brand) without a populated DB.
  return { id: SITE_ID, name: SITE.name, theme: SITE.defaultTheme || "midnight", domain: SITE.domain || "" };
}

export async function getPublishedArticles() {
  try {
    const res = await fetch(`${API}/api/articles?site_id=${SITE_ID}&status=published`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) return list.sort(byDateDesc);
    }
  } catch { /* fall through */ }
  // Fallback to the per-site seed articles (>=5, dated) when the API has none.
  return [...(SITE.seedArticles || [])].sort(byDateDesc);
}

// Slug helper so nav labels and article categories map to the same URL.
export function catSlug(label) {
  return String(label || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
