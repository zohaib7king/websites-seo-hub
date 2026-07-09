-- Migration 004: writer -> critic -> editor review pipeline + reusable sample articles.
-- Safe to run multiple times; init.sql includes the same shape for fresh DBs.

CREATE TABLE IF NOT EXISTS sample_articles (
  id           SERIAL PRIMARY KEY,
  site_id      TEXT REFERENCES sites(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  default_mode TEXT NOT NULL DEFAULT 'style_reference'
               CHECK (default_mode IN ('style_reference','source_material')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS sample_article_id INT REFERENCES sample_articles(id) ON DELETE SET NULL;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS sample_mode TEXT CHECK (sample_mode IN ('style_reference','source_material'));

ALTER TABLE articles ADD COLUMN IF NOT EXISTS review_notes JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_review_passed BOOLEAN DEFAULT FALSE;
