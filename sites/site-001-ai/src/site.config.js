// Per-site identity. This is the ONLY file that differs between sites — every
// other page/component is shared and reads from here, so the design stays in sync.
export const SITE = {
  name: "AI Insider Daily",
  // Hero headline is `${lead} <gradient>${accent}</gradient>`
  lead: "Stay ahead of",
  accent: "Artificial Intelligence",
  tagline: "Daily news, tool reviews, and practical tutorials for AI beginners and professionals.",
  eyebrow: "AI · Updated daily",
  nav: ["AI Tools", "News", "Tutorials", "Business AI"],
};
