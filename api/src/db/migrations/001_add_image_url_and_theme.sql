-- Migration 001: featured images + per-site themes
-- Safe to run multiple times (IF NOT EXISTS). init.sql already includes these
-- columns for fresh installs; this migration patches an EXISTING database so no
-- data is lost.

ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE sites    ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'midnight';

-- Backfill any pre-existing rows that came in before the column had a default.
UPDATE sites SET theme = 'midnight' WHERE theme IS NULL;
