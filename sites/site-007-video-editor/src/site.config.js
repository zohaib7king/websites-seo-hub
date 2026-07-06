// Fallback identity when API/CMS is empty. Live content comes from admin panel.
export const SITE = {
  name: "ibtihajForage",
  lead: "Stories that",
  accent: "hit harder",
  tagline: "Cinematic edits for YouTube, brands, weddings, and social — delivered on time.",
  eyebrow: "Freelance video editor · Available for hire",
  heroCta: "Hire me",
  aboutTitle: "About the editor",
  aboutBody:
    "I am a freelance video editor helping creators and businesses turn raw footage into scroll-stopping stories. From YouTube long-form and Reels to wedding films and brand ads — clean cuts, color, sound, and captions included.",
  email: "hello@frameforge.skoolai.cloud",
  phone: "+92 300 0000000",
  location: "Remote · Worldwide",
  defaultTheme: "pro",
  domain: "frameforge.skoolai.cloud",
  footerNote: "Professional freelance video editing. Fast turnaround. Clear communication.",
  social: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    whatsapp: "https://wa.me/923000000000",
  },
};

export function settingsFromCms(settings) {
  if (!settings) return SITE;
  return {
    name: settings.brand_name || SITE.name,
    lead: settings.hero_lead || SITE.lead,
    accent: settings.hero_accent || SITE.accent,
    tagline: settings.tagline || SITE.tagline,
    eyebrow: settings.eyebrow || SITE.eyebrow,
    heroCta: settings.hero_cta || SITE.heroCta,
    aboutTitle: settings.about_title || SITE.aboutTitle,
    aboutBody: settings.about_body || SITE.aboutBody,
    email: settings.email || SITE.email,
    phone: settings.phone || SITE.phone,
    location: settings.location || SITE.location,
    defaultTheme: SITE.defaultTheme,
    domain: SITE.domain,
    footerNote: settings.footer_note || SITE.footerNote,
    social: {
      instagram: settings.social_instagram || SITE.social.instagram,
      youtube: settings.social_youtube || SITE.social.youtube,
      vimeo: settings.social_vimeo || "",
      whatsapp: settings.social_whatsapp || SITE.social.whatsapp,
    },
  };
}
