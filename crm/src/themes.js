// Theme swatch data for the CRM picker — must stay in sync with each site's
// src/themes.js (name keys must match). Only the values needed to render a
// preview swatch are kept here (bg + accent + hero gradient).
export const THEMES = [
  { name: "midnight", label: "Midnight", bg: "#09090b", accent: "#818cf8", hero: "linear-gradient(135deg,#818cf8,#22d3ee)" },
  { name: "daylight", label: "Daylight", bg: "#f8fafc", accent: "#4f46e5", hero: "linear-gradient(135deg,#6366f1,#06b6d4)" },
  { name: "ocean",    label: "Ocean",    bg: "#0a1830", accent: "#38bdf8", hero: "linear-gradient(135deg,#0ea5e9,#22d3ee)" },
  { name: "sunset",   label: "Sunset",   bg: "#2a141c", accent: "#fb7185", hero: "linear-gradient(135deg,#f97316,#fb7185)" },
  { name: "forest",   label: "Forest",   bg: "#07120d", accent: "#34d399", hero: "linear-gradient(135deg,#10b981,#84cc16)" },
  { name: "royal",    label: "Royal",    bg: "#140a24", accent: "#a855f7", hero: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
];
