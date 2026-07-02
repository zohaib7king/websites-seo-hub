-- Editorial pet history stories + user-submitted pet stories (site-003-pets)

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
