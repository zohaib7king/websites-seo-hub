-- Thumbnail reel + team members (site-007-video-editor)

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

INSERT INTO editor_thumbnails (site_id, title, thumbnail_url, video_url, category, sort_order, status)
SELECT * FROM (VALUES
  ('site-007-video-editor', 'YouTube Documentary', 'https://picsum.photos/seed/ff-thumb-1/640/360', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Featured', 1, 'published'),
  ('site-007-video-editor', 'Brand Launch Ad', 'https://picsum.photos/seed/ff-thumb-2/640/360', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Commercial', 2, 'published'),
  ('site-007-video-editor', 'Wedding Highlight', 'https://picsum.photos/seed/ff-thumb-3/640/360', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Wedding', 3, 'published'),
  ('site-007-video-editor', 'Reels Pack', 'https://picsum.photos/seed/ff-thumb-4/640/360', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Social', 4, 'published'),
  ('site-007-video-editor', 'Podcast Clips', 'https://picsum.photos/seed/ff-thumb-5/640/360', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Podcast', 5, 'published'),
  ('site-007-video-editor', 'Event Aftermovie', 'https://picsum.photos/seed/ff-thumb-6/640/360', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Event', 6, 'published')
) AS v(site_id, title, thumbnail_url, video_url, category, sort_order, status)
WHERE NOT EXISTS (SELECT 1 FROM editor_thumbnails WHERE site_id = 'site-007-video-editor');

INSERT INTO editor_team (site_id, name, role, bio, photo_url, social_url, sort_order, status)
SELECT * FROM (VALUES
  ('site-007-video-editor', 'Ali Khan', 'Lead Video Editor', 'YouTube long-form, brand films, and cinematic color.', 'https://picsum.photos/seed/ff-team-1/400/400', 'https://instagram.com/', 1, 'published'),
  ('site-007-video-editor', 'Sara Ahmed', 'Motion & Reels', 'Short-form edits, captions, and trend-aware social cuts.', 'https://picsum.photos/seed/ff-team-2/400/400', 'https://instagram.com/', 2, 'published'),
  ('site-007-video-editor', 'Omar Hassan', 'Sound & Color', 'Audio mix, grading, and polish for every delivery.', 'https://picsum.photos/seed/ff-team-3/400/400', 'https://youtube.com/', 3, 'published')
) AS v(site_id, name, role, bio, photo_url, social_url, sort_order, status)
WHERE NOT EXISTS (SELECT 1 FROM editor_team WHERE site_id = 'site-007-video-editor');

UPDATE sites SET theme = 'sandwich' WHERE id = 'site-007-video-editor';
