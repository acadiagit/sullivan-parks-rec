// src/lib/config.js
// ── App-wide configuration ───────────────────────────────────
// Change TZ here and it applies everywhere — forms, display, calendar, events

export const TZ = 'America/New_York'  // Eastern time

export const SITE_NAME    = 'Sullivan Parks & Recreation'
export const SITE_URL     = 'https://www.parks-rec-sullivan.me'
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const BUCKET       = 'park-media'
// end of file
