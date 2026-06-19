// Server-side data helpers used by getServerSideProps.
// NEXT_PUBLIC_* are inlined at build time via docker-compose build.args.
const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID;

export async function getSite() {
  try {
    const res = await fetch(`${API}/api/sites/${SITE_ID}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function getPublishedArticles() {
  try {
    const res = await fetch(`${API}/api/articles?site_id=${SITE_ID}&status=published`);
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

// Slug helper so nav labels and article categories map to the same URL.
export function catSlug(label) {
  return String(label || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
