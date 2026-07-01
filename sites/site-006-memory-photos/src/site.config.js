// Per-site identity. The ONLY file that differs between sites.
export const SITE = {
  name: "Remake Memory",
  lead: "Bring childhood photos",
  accent: "into today",
  tagline: "Upload old family photos and recreate the same moment with updated faces — same scene, new memories.",
  eyebrow: "Memory photos · Face remake · Family keepsakes",
  nav: ["Home", "Demo", "How It Works", "Photo Remake", "About", "Contact"],
  defaultTheme: "sunset",
  domain: "remakememory.com",

  demoPairs: [
    {
      id: "siblings-park",
      title: "Siblings at the park",
      before: "https://picsum.photos/seed/rm-before-1/900/650",
      after: "https://picsum.photos/seed/rm-after-1/900/650",
      caption: "Same outdoor scene — childhood faces updated to today.",
    },
    {
      id: "birthday-cake",
      title: "Birthday celebration",
      before: "https://picsum.photos/seed/rm-before-2/900/650",
      after: "https://picsum.photos/seed/rm-after-2/900/650",
      caption: "Party background kept — only the faces were refreshed.",
    },
    {
      id: "school-steps",
      title: "First day of school",
      before: "https://picsum.photos/seed/rm-before-3/900/650",
      after: "https://picsum.photos/seed/rm-after-3/900/650",
      caption: "Classic school photo recreated with current portraits.",
    },
    {
      id: "family-porch",
      title: "Family on the porch",
      before: "https://picsum.photos/seed/rm-before-4/900/650",
      after: "https://picsum.photos/seed/rm-after-4/900/650",
      caption: "Two children mapped to their grown-up reference photos.",
    },
  ],

  howItWorksSteps: [
    {
      step: 1,
      title: "Upload your old photo",
      text: "Choose the childhood image you want to recreate — a single portrait or a group shot.",
      image: "https://picsum.photos/seed/rm-step-1/700/480",
    },
    {
      step: 2,
      title: "Add current face photos",
      text: "Upload clear, front-facing photos of each person today. One reference photo per face works best.",
      image: "https://picsum.photos/seed/rm-step-2/700/480",
    },
    {
      step: 3,
      title: "Map faces to people",
      text: "Tell the tool which face in the old photo belongs to which reference image.",
      image: "https://picsum.photos/seed/rm-step-3/700/480",
    },
    {
      step: 4,
      title: "Generate & download",
      text: "AI keeps the scene and swaps in updated faces. Compare before/after and save your remake.",
      image: "https://picsum.photos/seed/rm-step-4/700/480",
    },
  ],
};
