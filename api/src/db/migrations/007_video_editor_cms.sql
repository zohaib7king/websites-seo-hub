-- Freelance video editor portfolio CMS (site-007-video-editor)
-- Settings, portfolio, services, testimonials, contact inquiries — all admin-managed.

INSERT INTO sites (id, name, niche, domain, theme)
VALUES ('site-007-video-editor', 'FrameForge', 'video-editing', 'frameforge.skoolai.cloud', 'midnight')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  niche = EXCLUDED.niche,
  domain = EXCLUDED.domain,
  theme = EXCLUDED.theme;

CREATE TABLE IF NOT EXISTS editor_settings (
  site_id           TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
  brand_name        TEXT NOT NULL DEFAULT 'FrameForge',
  tagline           TEXT,
  eyebrow           TEXT,
  hero_lead         TEXT,
  hero_accent       TEXT,
  hero_cta          TEXT,
  about_title       TEXT,
  about_body        TEXT,
  email             TEXT,
  phone             TEXT,
  location          TEXT,
  social_instagram  TEXT,
  social_youtube    TEXT,
  social_vimeo      TEXT,
  social_whatsapp   TEXT,
  footer_note       TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editor_portfolio (
  id             SERIAL PRIMARY KEY,
  site_id        TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  video_url      TEXT,
  thumbnail_url  TEXT,
  client_name    TEXT,
  featured       BOOLEAN DEFAULT FALSE,
  sort_order     INT DEFAULT 0,
  status         TEXT DEFAULT 'published',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS editor_services (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  price_label  TEXT,
  features     TEXT[],
  sort_order   INT DEFAULT 0,
  status       TEXT DEFAULT 'published',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editor_testimonials (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL,
  client_role  TEXT,
  quote        TEXT NOT NULL,
  rating       INT DEFAULT 5,
  avatar_url   TEXT,
  sort_order   INT DEFAULT 0,
  status       TEXT DEFAULT 'published',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editor_inquiries (
  id            SERIAL PRIMARY KEY,
  site_id       TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  project_type  TEXT,
  message       TEXT NOT NULL,
  status        TEXT DEFAULT 'new',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults (idempotent: only if settings row missing)
INSERT INTO editor_settings (
  site_id, brand_name, tagline, eyebrow, hero_lead, hero_accent, hero_cta,
  about_title, about_body, email, phone, location,
  social_instagram, social_youtube, social_whatsapp, footer_note
)
SELECT
  'site-007-video-editor',
  'FrameForge',
  'Cinematic edits for YouTube, brands, weddings, and social — delivered on time.',
  'Freelance video editor · Available for hire',
  'Stories that',
  'hit harder',
  'Hire me',
  'About the editor',
  'I am a freelance video editor helping creators and businesses turn raw footage into scroll-stopping stories. From YouTube long-form and Reels to wedding films and brand ads — clean cuts, color, sound, and captions included.',
  'hello@frameforge.skoolai.cloud',
  '+92 300 0000000',
  'Remote · Worldwide',
  'https://instagram.com/',
  'https://youtube.com/',
  'https://wa.me/923000000000',
  'Professional freelance video editing. Fast turnaround. Clear communication.'
WHERE NOT EXISTS (
  SELECT 1 FROM editor_settings WHERE site_id = 'site-007-video-editor'
);

INSERT INTO editor_portfolio (site_id, title, slug, description, category, video_url, thumbnail_url, client_name, featured, sort_order, status)
SELECT * FROM (VALUES
  ('site-007-video-editor', 'YouTube Documentary Cut', 'youtube-documentary-cut',
   'Long-form storytelling with paced B-roll, lower-thirds, and a clean audio mix.',
   'YouTube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://picsum.photos/seed/ff-yt-doc/900/506', 'Creator Co.', TRUE, 1, 'published'),
  ('site-007-video-editor', 'Brand Product Launch Ad', 'brand-product-launch',
   '15s and 30s ad variants with motion graphics and punchy sound design.',
   'Commercial', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://picsum.photos/seed/ff-brand/900/506', 'Nova Goods', TRUE, 2, 'published'),
  ('site-007-video-editor', 'Wedding Highlight Film', 'wedding-highlight-film',
   'Emotional highlight reel with color grade and licensed music sync.',
   'Wedding', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://picsum.photos/seed/ff-wedding/900/506', 'Private client', TRUE, 3, 'published'),
  ('site-007-video-editor', 'Instagram Reels Pack', 'instagram-reels-pack',
   'Vertical edits with captions, zooms, and trend-aware pacing for social growth.',
   'Social', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://picsum.photos/seed/ff-reels/900/506', 'Growth Lab', FALSE, 4, 'published'),
  ('site-007-video-editor', 'Podcast Clip Series', 'podcast-clip-series',
   'Talking-head clips with dynamic captions and thumbnail-ready framing.',
   'Podcast', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://picsum.photos/seed/ff-podcast/900/506', 'Mic Room', FALSE, 5, 'published'),
  ('site-007-video-editor', 'Event Aftermovie', 'event-aftermovie',
   'High-energy aftermovie with multi-cam sync and crowd moments.',
   'Event', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://picsum.photos/seed/ff-event/900/506', 'City Fest', FALSE, 6, 'published')
) AS v(site_id, title, slug, description, category, video_url, thumbnail_url, client_name, featured, sort_order, status)
WHERE NOT EXISTS (
  SELECT 1 FROM editor_portfolio WHERE site_id = 'site-007-video-editor'
);

INSERT INTO editor_services (site_id, title, description, price_label, features, sort_order, status)
SELECT * FROM (VALUES
  ('site-007-video-editor', 'YouTube Long-form',
   'Full episode edit: pacing, B-roll, graphics, captions, and export masters.',
   'From $120 / video',
   ARRAY['Rough + final cut', 'Color & audio polish', 'Thumbnails optional'],
   1, 'published'),
  ('site-007-video-editor', 'Shorts & Reels',
   'Vertical content packs optimized for retention and trends.',
   'From $25 / short',
   ARRAY['Captions & hooks', 'Trend-aware cuts', 'Platform-ready exports'],
   2, 'published'),
  ('site-007-video-editor', 'Wedding & Events',
   'Highlight films and full-day recaps with cinematic grade.',
   'From $250 / project',
   ARRAY['Highlight reel', 'Music licensing guidance', '2 revision rounds'],
   3, 'published'),
  ('site-007-video-editor', 'Brand & Ads',
   'Product ads and social creatives for campaigns.',
   'Custom quote',
   ARRAY['Multiple lengths', 'Motion graphics', 'Fast turnaround'],
   4, 'published')
) AS v(site_id, title, description, price_label, features, sort_order, status)
WHERE NOT EXISTS (
  SELECT 1 FROM editor_services WHERE site_id = 'site-007-video-editor'
);

INSERT INTO editor_testimonials (site_id, client_name, client_role, quote, rating, sort_order, status)
SELECT * FROM (VALUES
  ('site-007-video-editor', 'Ayesha K.', 'YouTube creator',
   'Turnaround was fast and the pacing made my videos feel premium. Views jumped after the first upload.',
   5, 1, 'published'),
  ('site-007-video-editor', 'Omar R.', 'Brand manager',
   'Clean ads, on-brand motion, and zero drama on deadlines. Exactly what we needed for launch week.',
   5, 2, 'published'),
  ('site-007-video-editor', 'Sara & Bilal', 'Wedding clients',
   'Our highlight film made us cry (in a good way). Communication was clear from day one.',
   5, 3, 'published')
) AS v(site_id, client_name, client_role, quote, rating, sort_order, status)
WHERE NOT EXISTS (
  SELECT 1 FROM editor_testimonials WHERE site_id = 'site-007-video-editor'
);
