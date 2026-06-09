# Sullivan Parks & Rec — Phase 2 Design

*Draft: June 9, 2026*

Phase 2 goal: extend the working Events admin pattern (Phase 1) to **Programs**, **News**, and **Park Info** using a **unified content architecture** so we don't maintain three nearly-identical codebases.

Current state: Phase 1 (Events) is live and working. We will design from the lessons learned there.

## The 4 design decisions

Each section below: the question, the tradeoffs, my recommendation, and the rationale. Mark each with ✓ when decided.

---

### 1. Schema strategy ✓

**Decision: Single `content` table with `type` discriminator and JSONB extras for type-specific fields.**

Final schema (with park entity decision applied):

```
content
├── id            uuid PRIMARY KEY
├── type          text           ('event' | 'program' | 'news' | 'park_info')
├── title         text           NOT NULL
├── slug          text           NOT NULL
├── body_html     text
├── cover_url     text
├── status        text           default 'published', check in ('published', 'archived')
├── park_id       uuid           REFERENCES parks(id) NULL  -- required for park_info, optional for others
├── created_at    timestamptz    default now()
├── updated_at    timestamptz    default now()
├── created_by    uuid           REFERENCES auth.users
└── extras        jsonb          default '{}'  -- type-specific fields

UNIQUE (type, slug)              -- slugs unique within a type, not globally
```

**Examples of `extras` per type:**

```jsonc
// event
{ "start_at": "2026-06-12T10:00:00-04:00", "end_at": "2026-06-14T16:00:00-04:00", "location": "Sullivan Town Park" }

// program
{ "schedule_text": "Mon/Wed 6pm", "season_start": "2026-06-15", "season_end": "2026-08-20", "fee_cents": 5000, "age_range": "8-14", "registration_url": "https://..." }

// news
{ "publish_date": "2026-06-09" }

// park_info
{}  // no extras needed; structure is in the park entity itself
```

**Date format note:** all datetime values stored as ISO 8601 strings with timezone in JSONB. Display formatting happens via shared `formatDate()` helper, producing human-friendly output like "Tue, Jun 9, 2026 · 2:30 PM". Never display raw stored format.

**Indexes:**
```sql
CREATE INDEX content_type_status_idx ON content (type, status, created_at DESC);
CREATE INDEX content_park_id_idx ON content (park_id) WHERE park_id IS NOT NULL;
CREATE INDEX content_event_start_idx ON content ((extras->>'start_at')) WHERE type = 'event';
CREATE INDEX content_news_publish_idx ON content ((extras->>'publish_date')) WHERE type = 'news';
```

**Question:** how do we store fields that vary by content type (event dates, program fees, news author, park location)?

**Option A — Single table with JSONB extras**

```
content
├── id            uuid
├── type          text  ('event' | 'program' | 'news' | 'park_info')
├── title         text
├── slug          text
├── body_html     text
├── cover_url    text
├── status        text  ('draft' | 'published' | 'archived')
├── created_at    timestamptz
├── updated_at    timestamptz
└── extras        jsonb  -- type-specific fields
```

Examples of what `extras` holds per type:
```jsonc
// event
{ "start_at": "2026-06-12T10:00", "end_at": "2026-06-14T16:00", "location": "..." }

// program
{ "schedule": "Mon/Wed 6pm", "season_start": "2026-06-15", "fee_cents": 5000, "age_range": "8-14", "registration_url": "..." }

// news
{ "publish_date": "2026-06-09", "author": "Hugo Diaz" }

// park_info
{ "lat": 44.526, "lng": -68.187, "gallery": ["url1","url2"] }
```

Pros: one table, one migration, one set of RLS policies, one query pattern.
Cons: indexing JSONB needs care (we'd add expression indexes for common query paths, e.g., `(extras->>'publish_date')` for News).

**Option B — Base table + per-type detail tables**

```
content       (id, type, title, slug, body_html, ...)
event_extras  (content_id, start_at, end_at, location)
program_extras (content_id, schedule, fee_cents, ...)
news_extras   (content_id, publish_date, author)
park_extras   (content_id, lat, lng, gallery)
```

Pros: each type's fields are properly typed and indexable like normal columns.
Cons: 5 tables instead of 1, every read needs a JOIN, schema migrations multiply.

**My recommendation: A (JSONB extras).**

Reasoning: Supabase/Postgres handle JSONB extremely well. Type-specific querying (e.g., "events happening this week") is rare and easy to add a partial index for. The simplicity of one table for one mental model is worth it. If a future type explodes in complexity (say, an event-registration system with attendee tables), *that* gets its own table — JSONB doesn't prevent us from breaking out later.

**Decision: [ ] A   [ ] B**

---

### 2. Public URL routing ✓

**Decision: Type-specific paths.**

- `/events`, `/events/[slug]`, `/events/archive`
- `/programs`, `/programs/[slug]`, `/programs/archive`
- `/news`, `/news/[slug]`
- `/parks`, `/parks/[slug]` (park overview), `/parks/[park-slug]/[info-slug]` (specific info page)

Per-type page wrappers (10 lines each) all delegate to shared `<ContentDetail>` and `<ContentList>` components.

**Question:** what do the public-facing URLs look like?

**Option A — Type-specific paths**
- `/events`, `/events/[slug]`, `/events/archive`
- `/programs`, `/programs/[slug]`, `/programs/archive`
- `/news`, `/news/[slug]`, `/news/archive`
- `/parks`, `/parks/[slug]`

**Option B — Unified content path**
- `/content/events`, `/content/events/[slug]`, etc.

**My recommendation: A.**

Reasoning: URLs are user-facing. "Show me the programs page" maps cleanly to `/programs`. SEO is also better with semantic URLs — `/programs/youth-soccer-2026` reads better than `/content/programs/youth-soccer-2026`. The Phase 1 work already established `/events/[slug]`, so this preserves existing URLs and external links.

Implementation-wise, the routes share most code:
```
src/app/programs/[slug]/page.js  ─┐
src/app/news/[slug]/page.js      ─┼─→ all import from src/lib/content.js
src/app/parks/[slug]/page.js     ─┘
```

Each page is a 10-line wrapper that calls `getContent({ type: 'program', slug })` and passes to a shared `<ContentDetail>` component.

**Decision: [ ] A   [ ] B**

---

### 3. Admin routes ✓

**Decision: Type-specific paths matching public URLs.**

- `/admin/events`, `/admin/events/new`, `/admin/events/[id]/edit`
- `/admin/programs`, `/admin/programs/new`, `/admin/programs/[id]/edit`
- `/admin/news`, etc.
- `/admin/parks` for park entity management (separate from park_info content)

Each admin page wraps shared `<ContentForm>` and `<ContentList>` components, passing the `type` prop.

**Question:** what do the admin URLs look like?

**Option A — Type-specific paths** (matches public URLs above)
- `/admin/events`, `/admin/events/[id]/edit`
- `/admin/programs`, `/admin/programs/[id]/edit`
- `/admin/news`, etc.

**Option B — Unified admin path with type filter**
- `/admin/content?type=event`
- `/admin/content?type=program`

**My recommendation: A.**

Reasoning: Mary, Sparks, and any future admin think in terms of "I want to add a program," not "I want to add content of type=program." Mental model matters more in admin UI than in public UI because admins are doing focused work, not browsing. Separate URLs also mean we can have type-specific list views (e.g., events sorted by start date, news sorted by publish date) without conditional rendering.

Again, each admin page is a thin wrapper around shared `<ContentForm>` and `<ContentList>` components.

**Decision: [ ] A   [ ] B**

---

### 4. Migration of existing Events ✓

**Decision: Migrate existing events into the new `content` table.**

One-time SQL migration:
```sql
BEGIN;
INSERT INTO content (id, type, title, slug, body_html, cover_url, status, created_at, updated_at, extras)
SELECT
  id,
  'event',
  title,
  slug,
  body_html,
  cover_url,
  CASE WHEN archived THEN 'archived' ELSE 'published' END,
  created_at,
  updated_at,
  jsonb_build_object(
    'start_at', start_at,
    'end_at',   end_at,
    'location', location
  )
FROM events;

-- Verify
SELECT type, COUNT(*) FROM content GROUP BY type;

-- If counts match expected, proceed; otherwise ROLLBACK
COMMIT;

-- After verifying the application works against `content`:
-- DROP TABLE events;  (commit this as a separate change so we have a rollback window)
```

Existing event URLs (`/events/[slug]`) keep working because slugs are preserved.

**Question:** do we migrate the existing events from the current `events` table into the new unified `content` table?

**Option A — Migrate now**
- One-time SQL: `INSERT INTO content (type, title, ...) SELECT 'event', title, ... FROM events`
- Then update event-related code to use `content` table
- Then drop `events` table
- Existing event URLs (`/events/sullivan-daze-2026` etc.) keep working because we preserve slugs

**Option B — Grandfather**
- Old `events` table stays as-is, old code keeps using it
- New types (Programs, News, Park Info) use new `content` table
- Long-term: maintain two patterns forever

**My recommendation: A (migrate).**

Reasoning: B defeats the whole point. The reason we chose unified architecture is to avoid maintaining parallel patterns. If we grandfather Events out, we end up with two of everything (two table shapes, two query patterns, two admin form components). Six months in, we'd be looking at a 4x maintenance burden instead of 1x.

Migration risk is real but bounded: the Events table is small (we can count its rows in tens), the schema is well-understood, and we can do the migration with `BEGIN`/`COMMIT` so it's all-or-nothing. Production downtime: zero if we do it right (deploy new code, run migration, monitor).

**Decision: [ ] A   [ ] B**

---

---

### 5. Parks as a separate entity ✓

**Decision: Park is an entity, not just content.**

A separate `parks` table holds the real-world parks (Sullivan Town Park, etc.). Content of type `park_info` references a `park_id` to link info pages to their park.

```
parks
├── id            uuid
├── name          text          "Sullivan Town Park"
├── slug          text          "sullivan-town-park"
├── lat           numeric
├── lng           numeric
├── description   text          short overview
├── cover_url     text          primary photo
├── created_at    timestamptz
└── sort_order    int           manual ordering on public list page
```

**Schema impact on `content` table:**
- Add column `park_id uuid REFERENCES parks(id) NULL` — for `park_info` (required) and optionally for Programs/Events (e.g., "soccer league at Sullivan Town Park")
- Real column, not in `extras`, because:
  - It's a strict relationship (FK constraint)
  - We'll often filter on it ("show all info pages for this park")
  - Indexing FK is automatic and fast

**Public URL implications:**
- `/parks` — list of all 6 parks (queries `parks` table only)
- `/parks/[slug]` — park overview page; shows the park's description + all its info pages + upcoming events/programs at that park
- `/parks/[park-slug]/[info-slug]` — specific info page (queries `content` where `type='park_info'` AND `park_id=...` AND `slug=...`)

This adds one route file but unlocks "everything at Sullivan Town Park" as a natural future query.

**Migration:** seed the `parks` table with the 6 real parks before any park_info content gets created.

---

### 6. Admin & publication state ✓

**Permissions: Sparks + Hugo only (no per-type restrictions).** Same as Phase 1. RLS policy: `is_admin = true` can do anything on `content` and `parks` tables.

**Publication: always public-facing.** Status field stays simple: `published` (default, visible) and `archived` (hidden from public, restorable from admin). No `draft` state for now. If we need scheduled publication later, we add a `publish_at` timestamp; until then, "publish when you save" is the rule.

---

## After the 4 decisions

Once these are settled, the implementation roadmap is:

1. **Schema build** (Supabase) — create `content` table, RLS policies, indexes
2. **Migration script** — copy existing events into `content`, verify, prepare to drop old table
3. **`src/lib/content.js`** — shared read/write helpers (replaces today's events-specific helpers)
4. **`<ContentForm>` component** — refactored from `EventForm`, accepts a `type` prop
5. **`<ContentDetail>` component** — refactored from event detail page
6. **`<ContentList>` component** — for admin list views and public listing pages
7. **Per-type page wrappers** — 10-line files per route
8. **Events cutover** — switch event pages to use new components, drop old table
9. **Add Programs** — first new type using the unified system
10. **Add News + Park Info** — last two types

Steps 1-3 are foundational and risky. Steps 4-8 are the cutover (highest risk: keeping Events working through the transition). Steps 9-10 are the payoff — adding new types becomes a 1-2 hour exercise instead of a multi-day rebuild.

## Open questions for Hugo — all answered

✓ Date display format: human-readable everywhere (e.g., `Tue, Jun 9, 2026 · 2:30 PM`); ISO 8601 in storage
✓ Sort/search: latest-first, no search UI for Phase 2 (NL interface deferred)
✓ Admin permissions: Sparks + Hugo only, no per-type restrictions
✓ Park is an entity (separate `parks` table) — info pages reference parks via FK
✓ Publication: simple `published`/`archived` toggle, no draft state

# end of file
