import { SITE } from "../site.config";
import { byDateDesc, withArticleStats } from "./seed";

const API = process.env.NEXT_PUBLIC_API_URL || "http://api:4000";
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || "site-003-pets";

async function getPersistedStats() {
  try {
    const res = await fetch(`${API}/api/articles/stats?site_id=${encodeURIComponent(SITE_ID)}`);
    if (!res.ok) return {};
    const rows = await res.json();
    if (!Array.isArray(rows)) return {};
    return rows.reduce((map, row) => ({ ...map, [row.slug]: row }), {});
  } catch {
    return {};
  }
}

function mergePersistedStats(article, statsBySlug) {
  const stats = statsBySlug[article.slug];
  return withArticleStats({
    ...article,
    view_count: stats?.view_count ?? article.view_count,
    like_count: stats?.like_count ?? article.like_count,
  });
}

function mergeStoryStats(story, dbStory) {
  if (!dbStory) return withArticleStats(story);
  return withArticleStats({
    ...story,
    view_count: dbStory.view_count ?? story.view_count,
    like_count: dbStory.like_count ?? story.like_count,
  });
}

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

export async function getPublishedArticles() {
  const statsBySlug = await getPersistedStats();
  try {
    const res = await fetch(`${API}/api/articles?site_id=${SITE_ID}&status=published`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return list.map(article => mergePersistedStats(article, statsBySlug)).sort(byDateDesc);
      }
    }
  } catch { /* fall through */ }
  return [...(SITE.seedArticles || [])].map(article => mergePersistedStats(article, statsBySlug)).sort(byDateDesc);
}

export async function getPetStories() {
  let dbStories = [];
  try {
    const res = await fetch(`${API}/api/pet-stories?site_id=${SITE_ID}`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) dbStories = list;
    }
  } catch { /* fall through */ }

  const dbBySlug = dbStories.reduce((map, s) => ({ ...map, [s.slug]: s }), {});
  const seeds = SITE.seedStories || [];

  if (dbStories.length > 0) {
    const merged = seeds.map(s => mergeStoryStats(s, dbBySlug[s.slug]));
    const extra = dbStories
      .filter(s => !seeds.find(seed => seed.slug === s.slug))
      .map(s => withArticleStats(s));
    return [...merged, ...extra].sort(byDateDesc);
  }
  return seeds.map(s => withArticleStats(s)).sort(byDateDesc);
}

export async function getUserPetStories() {
  try {
    const res = await fetch(`${API}/api/user-pet-stories?site_id=${SITE_ID}`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) return list.map(s => withArticleStats(s)).sort(byDateDesc);
    }
  } catch { /* fall through */ }
  return [];
}

export function catSlug(label) {
  return String(label || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
