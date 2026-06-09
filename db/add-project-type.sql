-- add-project-type.sql
-- Path: ~/coworker/parks/db/add-project-type.sql
-- Desc: Allow 'project' as a valid content.type. Required after Phase 2 design
--       expanded from 4 → 5 content types.
-- ============================================================

-- Postgres won't let us just edit a CHECK constraint; we drop and re-add.
-- This is safe: it doesn't lock the table for long and never rejects existing rows.

BEGIN;

ALTER TABLE content
  DROP CONSTRAINT IF EXISTS content_type_check;

ALTER TABLE content
  ADD CONSTRAINT content_type_check
  CHECK (type IN ('event', 'program', 'news', 'park_info', 'project'));

-- Verify
SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class       rel ON rel.oid = con.conrelid
WHERE rel.relname = 'content' AND con.conname = 'content_type_check';

COMMIT;

-- Expected output:
-- conname            | definition
-- content_type_check | CHECK ((type = ANY (ARRAY['event'::text, 'program'::text, 'news'::text, 'park_info'::text, 'project'::text])))

-- end of file
