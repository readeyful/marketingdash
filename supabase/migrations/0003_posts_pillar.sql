-- Adds the content pillar tag to posts, shown on the calendar thumbnails.

alter table posts add column if not exists pillar text;
