-- Migration 003: persistent article views/likes + simple site user accounts.
-- Safe to run multiple times; init.sql includes the same shape for fresh DBs.

ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

UPDATE articles SET view_count = 0 WHERE view_count IS NULL;
UPDATE articles SET like_count = 0 WHERE like_count IS NULL;

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

INSERT INTO article_stats (site_id, slug, view_count, like_count)
SELECT site_id, slug, COALESCE(view_count, 0), COALESCE(like_count, 0)
FROM articles
WHERE site_id IS NOT NULL AND slug IS NOT NULL
ON CONFLICT (site_id, slug) DO NOTHING;
