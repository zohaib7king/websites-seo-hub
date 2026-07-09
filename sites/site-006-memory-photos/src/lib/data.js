import { SITE } from "../site.config";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID;

export async function getSite() {
  try {
    const res = await fetch(`${API}/api/sites/${SITE_ID}`);
    if (res.ok) {
      const s = await res.json();
      if (s) return { ...s, theme: s.theme || SITE.defaultTheme || "sunset" };
    }
  } catch { /* fall through */ }
  return { id: SITE_ID, name: SITE.name, theme: SITE.defaultTheme || "sunset", domain: SITE.domain || "" };
}

export const API_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  : API;
