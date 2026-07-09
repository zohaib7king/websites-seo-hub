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
  id                SERIAL PRIMARY KEY,
  site_id           TEXT REFERENCES sites(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,
  content           TEXT NOT NULL,
  meta_desc         TEXT,
  category          TEXT,
  tags              TEXT[],
  image_url         TEXT,                      -- featured image; NULL → gradient placeholder
  view_count        INT DEFAULT 0,
  like_count        INT DEFAULT 0,
  status            TEXT DEFAULT 'draft',      -- draft | scheduled | published
  ai_generated      BOOLEAN DEFAULT FALSE,
  review_notes      JSONB,                     -- writer/critic/editor pipeline notes (critique + unresolved issues)
  ai_review_passed  BOOLEAN DEFAULT FALSE,      -- true when the editor stage resolved every critic issue
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Reusable samples of the site owner's own writing. The writer agent can use
-- these either as a voice/style reference or as source material to rework.
CREATE TABLE IF NOT EXISTS sample_articles (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  default_mode TEXT NOT NULL DEFAULT 'style_reference'
               CHECK (default_mode IN ('style_reference','source_material')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
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
  id                 SERIAL PRIMARY KEY,
  site_id            TEXT REFERENCES sites(id) ON DELETE CASCADE,
  keyword            TEXT NOT NULL,
  status             TEXT DEFAULT 'pending',    -- pending | generating | done | failed
  article_id         INT REFERENCES articles(id),
  sample_article_id  INT REFERENCES sample_articles(id) ON DELETE SET NULL,
  sample_mode        TEXT CHECK (sample_mode IN ('style_reference','source_material')),
  scheduled_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
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
