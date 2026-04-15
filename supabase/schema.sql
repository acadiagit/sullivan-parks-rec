-- ============================================================
-- Sullivan Parks & Recreation — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "unaccent";

-- ── PARKS ───────────────────────────────────────────────────
create table if not exists parks (
  id            bigint primary key generated always as identity,
  name          text not null,
  slug          text not null unique,
  description   text,
  amenities     text[]   default '{}',
  address       text,
  lat           numeric(9,6),
  lng           numeric(9,6),
  hours         text,
  cover_photo   text,    -- Supabase Storage path
  published     boolean  default true,
  sort_order    int      default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── EVENTS ──────────────────────────────────────────────────
create table if not exists events (
  id            bigint primary key generated always as identity,
  title         text not null,
  slug          text not null unique,
  description   text,
  start_at      timestamptz not null,
  end_at        timestamptz,
  location      text,
  category      text     default 'General',
  cover_photo   text,
  published     boolean  default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── ARTICLES (news / announcements) ─────────────────────────
create table if not exists articles (
  id            bigint primary key generated always as identity,
  title         text not null,
  slug          text not null unique,
  body          text,    -- rich text HTML from TipTap
  excerpt       text,
  cover_photo   text,
  author        text     default 'Sullivan Parks & Rec',
  published     boolean  default false,
  published_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── PROGRAMS ────────────────────────────────────────────────
create table if not exists programs (
  id            bigint primary key generated always as identity,
  name          text not null,
  slug          text not null unique,
  description   text,
  group_label   text     default 'General',   -- Youth / Adult / Senior
  age_range     text,
  season        text,
  status        text     default 'Open',      -- Open / Coming Soon / Full / Closed
  registration_url text,
  published     boolean  default true,
  sort_order    int      default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── PROJECTS ────────────────────────────────────────────────
create table if not exists projects (
  id            bigint primary key generated always as identity,
  title         text not null,
  slug          text not null unique,
  description   text,
  status        text     default 'Planned',   -- Planned / In Progress / Completed
  progress_pct  int      default 0 check (progress_pct between 0 and 100),
  year          text,
  published     boolean  default true,
  sort_order    int      default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── ADMIN USERS ─────────────────────────────────────────────
create table if not exists admin_users (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null unique,
  full_name     text,
  role          text default 'staff',    -- staff / admin
  created_at    timestamptz default now()
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger parks_updated_at    before update on parks    for each row execute function set_updated_at();
create trigger events_updated_at   before update on events   for each row execute function set_updated_at();
create trigger articles_updated_at before update on articles for each row execute function set_updated_at();
create trigger programs_updated_at before update on programs for each row execute function set_updated_at();
create trigger projects_updated_at before update on projects for each row execute function set_updated_at();

-- ── FULL-TEXT SEARCH ─────────────────────────────────────────
-- Unified search across all content types via a view
create or replace view search_index as
  select 'park'    as type, id::text, name as title, description as body, '/parks'    as href, created_at from parks    where published
  union all
  select 'event'   as type, id::text, title,         description as body, '/events'   as href, created_at from events   where published
  union all
  select 'article' as type, id::text, title,         excerpt     as body, '/news'     as href, created_at from articles where published
  union all
  select 'program' as type, id::text, name as title, description as body, '/programs' as href, created_at from programs where published;

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table parks        enable row level security;
alter table events       enable row level security;
alter table articles     enable row level security;
alter table programs     enable row level security;
alter table projects     enable row level security;
alter table admin_users  enable row level security;

-- Public can read published content
create policy "public read parks"     on parks     for select using (published = true);
create policy "public read events"    on events    for select using (published = true);
create policy "public read articles"  on articles  for select using (published = true);
create policy "public read programs"  on programs  for select using (published = true);
create policy "public read projects"  on projects  for select using (published = true);

-- Admins can do everything (service role bypasses RLS automatically)
create policy "admin all parks"     on parks     for all using (auth.role() = 'authenticated');
create policy "admin all events"    on events    for all using (auth.role() = 'authenticated');
create policy "admin all articles"  on articles  for all using (auth.role() = 'authenticated');
create policy "admin all programs"  on programs  for all using (auth.role() = 'authenticated');
create policy "admin all projects"  on projects  for all using (auth.role() = 'authenticated');
create policy "admin read self"     on admin_users for select using (auth.uid() = id);

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Run separately in Dashboard → Storage → New bucket
-- Name: parks-media   Public: true

-- ============================================================
-- SEED DATA — sample content to get started
-- ============================================================

insert into parks (name, slug, description, amenities, address, hours, published) values
(
  'Sullivan Harbor',
  'sullivan-harbor',
  'Public boat launch, kayak access, and stunning views of Frenchman Bay and the Schoodic Peninsula.',
  array['Boat Launch','Kayak Access','Parking','Picnic Tables'],
  '1 Harbor Road, Sullivan, ME 04664',
  'Open year-round, dawn to dusk',
  true
),
(
  'Tunk Lake Recreation Area',
  'tunk-lake',
  'Freshwater swimming, fishing, and hiking. The Tunk Lake Trail offers 4 miles of scenic forest walking.',
  array['Swimming','Fishing','Hiking','Picnic Area','Grills'],
  'Route 182, Sullivan, ME 04664',
  'Memorial Day – Labor Day, 8am–6pm',
  true
),
(
  'Sullivan Rec Field',
  'rec-field',
  'Multi-use athletic field hosting youth soccer, softball, and community events throughout the season.',
  array['Soccer Field','Softball Diamond','Restrooms','Parking'],
  '12 Recreation Way, Sullivan, ME 04664',
  'Open year-round',
  true
);

insert into events (title, slug, description, start_at, end_at, location, category, published) values
(
  'Spring Trail Cleanup',
  'spring-trail-cleanup-2026',
  'Join neighbors for the annual spring cleanup of Tunk Lake trails. Gloves and bags provided.',
  '2026-05-10 09:00:00-04',
  '2026-05-10 12:00:00-04',
  'Tunk Lake Trail Head',
  'Volunteer',
  true
),
(
  'Kayak & Canoe Launch Day',
  'kayak-launch-day-2026',
  'Free guided kayak tours of Sullivan Harbor and Frenchman Bay. All skill levels welcome.',
  '2026-05-17 08:00:00-04',
  '2026-05-17 14:00:00-04',
  'Sullivan Harbor',
  'Recreation',
  true
),
(
  'Sullivan Daze Festival',
  'sullivan-daze-2026',
  'Annual community celebration featuring music, food vendors, craft fair, kids activities, and kayak races.',
  '2026-08-16 10:00:00-04',
  '2026-08-16 17:00:00-04',
  'Sullivan Town Common',
  'Community',
  true
);

insert into programs (name, slug, description, group_label, age_range, season, status, published, sort_order) values
('Summer Soccer League',        'summer-soccer',       'Youth soccer league, games run June through August on weekends.', 'Youth',  '6–14',      'June–August',     'Open',        true, 1),
('Nature Explorers Camp',       'nature-camp',         'Week-long day camp exploring Sullivan forests and coastline.',     'Youth',  '7–12',      'July',            'Coming Soon', true, 2),
('Junior Kayak Skills',         'junior-kayak',        'Learn paddling basics in Sullivan Harbor. Life jackets provided.', 'Youth',  '10–15',     'June–July',       'Coming Soon', true, 3),
('Morning Yoga at the Harbor',  'morning-yoga',        'Outdoor yoga with harbor views. All levels welcome.',              'Adult',  'All adults','June–August',     'Open',        true, 4),
('Adult Kayak Tours',           'adult-kayak',         'Guided tours of Frenchman Bay. No experience necessary.',          'Adult',  '18+',       'May–September',   'Open',        true, 5),
('Bone Builders Exercise',      'bone-builders',       'Low-impact strength training for bone health.',                    'Senior', '60+',       'Year-round',      'Open',        true, 6),
('Senior Birdwatching Walk',    'senior-birdwatch',    'Guided walks in prime birding habitat around Sullivan.',           'Senior', '55+',       'May–October',     'Open',        true, 7);

insert into projects (title, slug, description, status, progress_pct, year, published, sort_order) values
('Tunk Lake Picnic Area Expansion', 'tunk-picnic-expansion', 'Adding four new picnic shelters, upgraded grills, and accessible path to water.', 'In Progress', 65,  '2026', true, 1),
('Sullivan Harbor Kayak Launch Ramp','harbor-kayak-ramp',    'Dedicated kayak and canoe launch ramp with parking improvements.',               'Completed',   100, '2025', true, 2),
('Rec Field Lighting Upgrade',       'rec-field-lighting',   'LED lighting installation for evening youth sports programs.',                    'Planned',     10,  '2027', true, 3);

insert into articles (title, slug, excerpt, body, author, published, published_at) values
(
  'New Picnic Area Opens at Tunk Lake',
  'tunk-lake-picnic-area-opens',
  'The Parks Committee has completed the new waterfront picnic area with tables, grills, and a kayak launch ramp.',
  '<p>The Parks Committee has completed the new waterfront picnic area at Tunk Lake, featuring four picnic tables, charcoal grills, and a new kayak launch ramp.</p><p>The area is open daily from dawn to dusk and is free to all Sullivan residents and visitors.</p>',
  'Sullivan Parks & Rec',
  true,
  '2026-04-08 09:00:00-04'
),
(
  'Summer Program Registration Now Open',
  'summer-program-registration-2026',
  'Sign up for youth day camps, kayak skills, and nature walks starting June 23. Spots fill quickly.',
  '<p>Registration is now open for all Sullivan Parks & Recreation summer programs. Youth soccer, nature camp, and kayak skills courses are filling fast.</p><p>Contact the town office at 207-422-6282 to register or visit this site.</p>',
  'Sullivan Parks & Rec',
  true,
  '2026-04-01 09:00:00-04'
);

-- ============================================================
-- end of file
-- ============================================================
