import { SITE, settingsFromCms } from "../site.config";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-007-video-editor";

export async function getSite() {
  try {
    const res = await fetch(`${API}/api/sites/${SITE_ID}`);
    if (res.ok) {
      const s = await res.json();
      if (s) return { ...s, theme: s.theme || SITE.defaultTheme || "cinema" };
    }
  } catch { /* fall through */ }
  return { id: SITE_ID, name: SITE.name, theme: SITE.defaultTheme || "cinema", domain: SITE.domain || "" };
}

export async function getEditorBundle() {
  try {
    const res = await fetch(`${API}/api/video-editor/${SITE_ID}/bundle`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return {
        brand: settingsFromCms(data.settings),
        portfolio: data.portfolio || [],
        services: data.services || [],
        testimonials: data.testimonials || [],
      };
    }
  } catch { /* fall through */ }
  return { brand: SITE, portfolio: [], services: [], testimonials: [] };
}

export function youtubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* ignore */ }
  return null;
}
