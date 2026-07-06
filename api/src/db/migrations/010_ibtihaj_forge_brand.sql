-- Rebrand FrameForge → ibtihajForage + colorful forge theme
UPDATE sites SET name = 'ibtihajForage', theme = 'forge' WHERE id = 'site-007-video-editor';
UPDATE editor_settings SET brand_name = 'ibtihajForage' WHERE site_id = 'site-007-video-editor';
