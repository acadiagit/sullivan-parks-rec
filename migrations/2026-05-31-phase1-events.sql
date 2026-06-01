-- 2026-05-31-phase1-events.sql
-- Path: ~/coworker/parks/migrations/2026-05-31-phase1-events.sql
-- Description: Phase 1 schema additions for events admin upgrade.
--              Adds body, cover_image_url, archived_at. Already executed
--              via Supabase SQL editor on 2026-05-31.
-- Idempotent — safe to re-run.

ALTER TABLE events ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_events_archived_at ON events (archived_at);

-- end of file
