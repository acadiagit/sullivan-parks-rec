-- phase3-search.sql
-- Path: ~/coworker/parks/db/phase3-search.sql
-- Description: Full-text search over the unified `content` table. Adds a weighted,
--              self-maintaining tsvector column, a GIN index, and a ranked
--              search_content() function that public search calls via RPC.
--              Run sections in order.
-- ============================================================

-- ── 1. Weighted search vector (generated, self-maintaining) ──────────────────
-- Weights: title = A (highest), summary = B, body = C.
-- HTML tags are stripped from body so tag names never pollute the index.
alter table content
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title,   '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english',
      regexp_replace(coalesce(body_html, ''), '<[^>]+>', ' ', 'g')), 'C')
  ) stored;

-- ── 2. GIN index for fast matching ───────────────────────────────────────────
create index if not exists content_search_idx
  on content using gin (search_vector);

-- ── 3. Ranked search function (single source of truth for search) ────────────
-- websearch_to_tsquery handles "quoted phrases", OR, and -exclusions naturally.
-- Returns published rows only, ordered by relevance then recency.
create or replace function search_content(query text)
returns setof content
language sql
stable
as $$
  select *
  from content
  where status = 'published'
    and search_vector @@ websearch_to_tsquery('english', query)
  order by
    ts_rank(search_vector, websearch_to_tsquery('english', query)) desc,
    created_at desc
  limit 50
$$;

-- ── 4. VERIFY (run after the above) ──────────────────────────────────────────
-- Should return ranked rows touching "kayak" across events/news/projects.
select type, title, slug
from search_content('kayak');

-- Stemming check — "camps" should match "camp" in the program body.
select type, title from search_content('camps');

-- end of file
