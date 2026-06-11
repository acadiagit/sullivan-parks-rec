-- migrate-phase1-content.sql
-- Path: ~/coworker/parks/db/migrate-phase1-content.sql
-- Description: One-time migration of stranded Phase 1 rows (1 program, 3 articles,
--              3 projects) into the unified `content` table. Old tables are left
--              untouched as a safety net. Run sections in order.
-- ============================================================

-- ── 0. PRE-FLIGHT: slug collision check (run this FIRST, on its own) ──────────
-- If this returns any rows, two records would fight over the same slug.
-- Resolve before running the transaction below (rename a slug, or skip a row).
select c.type, c.slug, 'collides with incoming' as note
from content c
where c.slug in (
  select slug from programs
  union all select slug from articles
  union all select slug from projects
);

-- ── 1. MIGRATION (run as one block — all-or-nothing) ─────────────────────────
begin;

-- Programs ────────────────────────────────────────────────
insert into content
  (type, title, slug, summary, body_html, category, status, extras, created_at, updated_at)
select
  'program',
  name,
  slug,
  left(regexp_replace(description, E'\\s+', ' ', 'g'), 160),          -- tidy one-liner
  '<p>' || replace(trim(description), E'\n\n', '</p><p>') || '</p>',   -- paragraphs → HTML
  'Camps',
  case when published then 'published' else 'archived' end,
  jsonb_strip_nulls(jsonb_build_object(
    'group_label',      group_label,
    'age_range',        age_range,
    'season',           season,
    'registration_url', registration_url,
    'program_status',   status          -- old "Full" lives here, NOT content.status
  )),
  created_at,
  updated_at
from programs;

-- Articles → news ─────────────────────────────────────────
insert into content
  (type, title, slug, summary, body_html, cover_url, category, status, extras, created_at, updated_at)
select
  'news',
  title,
  slug,
  excerpt,
  body,                                  -- already HTML
  cover_photo,
  'Announcement',
  case when published then 'published' else 'archived' end,
  jsonb_strip_nulls(jsonb_build_object(
    'author',       author,
    'publish_date', to_char(published_at, 'YYYY-MM-DD')   -- date-only for the form
  )),
  created_at,
  updated_at
from articles;

-- Projects ────────────────────────────────────────────────
insert into content
  (type, title, slug, summary, body_html, status, extras, created_at, updated_at)
select
  'project',
  title,
  slug,
  description,
  '<p>' || trim(description) || '</p>',
  case when published then 'published' else 'archived' end,
  jsonb_strip_nulls(jsonb_build_object(
    'project_status', status,            -- "In Progress"/"Completed"/"Planned"
    'progress_pct',   progress_pct,
    'year',           year
  )),
  created_at,
  updated_at
from projects;

commit;

-- ── 2. VERIFY (run after commit — eyeball the 7 migrated rows) ────────────────
select type, title, slug, status, category, extras
from content
where type in ('program', 'news', 'project')
order by type, title;

-- Sanity counts — should read program=1, news=3, project=3
select type, count(*)
from content
where type in ('program', 'news', 'project')
group by type
order by type;

-- end of file
