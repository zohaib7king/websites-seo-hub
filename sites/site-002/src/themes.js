// Theme presets shared by the whole site. The selected theme name is stored on
// the site record (sites.theme) and applied as CSS variables in Layout.jsx.
export const THEMES = {
  midnight: {
    label: "Midnight",
    bg: "#09090b", surface: "#18181b", border: "#27272a",
    accent: "#818cf8", accent2: "#22d3ee", text: "#f4f4f5", muted: "#a1a1aa",
    body: "#09090b",
    hero: "linear-gradient(135deg,#818cf8 0%,#22d3ee 100%)",
  },
  daylight: {
    label: "Daylight",
    bg: "#ffffff", surface: "#f4f4f5", border: "#e4e4e7",
    accent: "#4f46e5", accent2: "#0891b2", text: "#18181b", muted: "#52525b",
    body: "#f8fafc",
    hero: "linear-gradient(135deg,#6366f1 0%,#06b6d4 100%)",
  },
  ocean: {
    label: "Ocean",
    bg: "#0a1830", surface: "#0f2547", border: "#1e3a5f",
    accent: "#38bdf8", accent2: "#22d3ee", text: "#e0f2fe", muted: "#93b4d4",
    body: "linear-gradient(160deg,#0a1830 0%,#0d2b52 100%)",
    hero: "linear-gradient(135deg,#0ea5e9 0%,#22d3ee 100%)",
  },
  sunset: {
    label: "Sunset",
    bg: "#1a0d12", surface: "#2a141c", border: "#43202c",
    accent: "#fb7185", accent2: "#fbbf24", text: "#fff1f2", muted: "#d8a3ad",
    body: "linear-gradient(160deg,#2a141c 0%,#3d1a14 100%)",
    hero: "linear-gradient(135deg,#f97316 0%,#fb7185 100%)",
  },
  forest: {
    label: "Forest",
    bg: "#07120d", surface: "#0f1c16", border: "#1d3327",
    accent: "#34d399", accent2: "#a3e635", text: "#f0fdf4", muted: "#8aa898",
    body: "linear-gradient(160deg,#07120d 0%,#0a1f16 100%)",
    hero: "linear-gradient(135deg,#10b981 0%,#84cc16 100%)",
  },
  royal: {
    label: "Royal",
    bg: "#140a24", surface: "#1f0f38", border: "#33205a",
    accent: "#a855f7", accent2: "#ec4899", text: "#f5f3ff", muted: "#b9a8d8",
    body: "linear-gradient(160deg,#140a24 0%,#241046 100%)",
    hero: "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)",
  },
};

export function getTheme(name) {
  return THEMES[name] || THEMES.midnight;
}
