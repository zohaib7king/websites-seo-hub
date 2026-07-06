-- ZoyZoy Hub — Database Schema
-- Run once on first start (handled by Docker entrypoint)

CREATE TABLE IF NOT EXISTS sites (
  id           TEXT PRIMARY KEY,          -- e.g. "site-001-ai"
  name         TEXT NOT NULL,             -- "AI Insider Daily"
  niche        TEXT NOT NULL,             -- "artificial-intelligence"
  domain       TEXT,                      -- "aiinsiderdaily.com"
  adsense_id   TEXT,
  status       TEXT DEFAULT 'active',     -- active | paused | archived
  theme        TEXT DEFAULT 'midnight',   -- midnight | daylight | ocean | sunset | forest | royal
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL,
  content      TEXT NOT NULL,
  meta_desc    TEXT,
  category     TEXT,
  tags         TEXT[],
  image_url    TEXT,                      -- featured image; NULL → gradient placeholder
  view_count   INT DEFAULT 0,
  like_count   INT DEFAULT 0,
  status       TEXT DEFAULT 'draft',      -- draft | scheduled | published
  ai_generated BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS site_users (
  id            SERIAL PRIMARY KEY,
  site_id       TEXT REFERENCES sites(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, email)
);

CREATE TABLE IF NOT EXISTS article_stats (
  site_id     TEXT REFERENCES sites(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  view_count  INT DEFAULT 0,
  like_count  INT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (site_id, slug)
);

CREATE TABLE IF NOT EXISTS article_likes (
  site_id    TEXT REFERENCES sites(id) ON DELETE CASCADE,
  slug       TEXT NOT NULL,
  user_id    INT REFERENCES site_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (site_id, slug, user_id)
);

CREATE TABLE IF NOT EXISTS content_queue (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  keyword      TEXT NOT NULL,
  status       TEXT DEFAULT 'pending',    -- pending | generating | done | failed
  article_id   INT REFERENCES articles(id),
  scheduled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  impressions  INT DEFAULT 0,
  clicks       INT DEFAULT 0,
  earnings_usd NUMERIC(10,4) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, date)
);

-- Seed: first site
INSERT INTO sites (id, name, niche, domain) VALUES
  ('site-001-ai', 'AI Insider Daily', 'artificial-intelligence', 'aiinsiderdaily.com')
ON CONFLICT DO NOTHING;

INSERT INTO sites (id, name, niche, domain, theme) VALUES
  ('site-005-gulf-jobs', 'Gulf Jobs Guide', 'gulf-jobs', 'gulfjobss.com', 'royal')
ON CONFLICT DO NOTHING;

INSERT INTO sites (id, name, niche, domain, theme) VALUES
  ('site-006-memory-photos', 'Remake Memory', 'memory-photos', 'memory.skoolai.cloud', 'sunset')
ON CONFLICT DO NOTHING;

-- Pet stories tables (site-003-pets)
CREATE TABLE IF NOT EXISTS pet_stories (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  image_url    TEXT,
  category     TEXT,
  view_count   INT DEFAULT 0,
  like_count   INT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS pet_story_likes (
  site_id    TEXT REFERENCES sites(id) ON DELETE CASCADE,
  slug       TEXT NOT NULL,
  user_id    INT REFERENCES site_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (site_id, slug, user_id)
);

CREATE TABLE IF NOT EXISTS user_pet_stories (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  user_id      INT REFERENCES site_users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  image_url    TEXT,
  pet_type     TEXT,
  view_count   INT DEFAULT 0,
  like_count   INT DEFAULT 0,
  status       TEXT DEFAULT 'published',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_pet_story_likes (
  site_id    TEXT REFERENCES sites(id) ON DELETE CASCADE,
  story_id   INT REFERENCES user_pet_stories(id) ON DELETE CASCADE,
  user_id    INT REFERENCES site_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (site_id, story_id, user_id)
);

INSERT INTO sites (id, name, niche, domain, theme) VALUES
  ('site-003-pets', 'Pet Lovers Daily', 'pet-care', 'petlovers.com', 'petportal')
ON CONFLICT DO NOTHING;

INSERT INTO sites (id, name, niche, domain, theme) VALUES
  ('site-007-video-editor', 'ibtihajForage', 'video-editing', 'frameforge.skoolai.cloud', 'forge')
ON CONFLICT DO NOTHING;

-- Video editor portfolio CMS (site-007-video-editor)
CREATE TABLE IF NOT EXISTS editor_settings (
  site_id           TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
  brand_name        TEXT NOT NULL DEFAULT 'ibtihajForage',
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

CREATE TABLE IF NOT EXISTS editor_thumbnails (
  id             SERIAL PRIMARY KEY,
  site_id        TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  thumbnail_url  TEXT NOT NULL,
  video_url      TEXT,
  category       TEXT,
  sort_order     INT DEFAULT 0,
  status         TEXT DEFAULT 'published',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editor_team (
  id             SERIAL PRIMARY KEY,
  site_id        TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  role           TEXT,
  bio            TEXT,
  photo_url      TEXT,
  social_url     TEXT,
  sort_order     INT DEFAULT 0,
  status         TEXT DEFAULT 'published',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
