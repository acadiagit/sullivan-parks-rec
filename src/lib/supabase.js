// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase environment variables')
}

// Always fetch fresh data. Without this, Next.js on Vercel caches Supabase
// reads indefinitely, so admin edits never reach public pages (Nov 11 2026).
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  global: {
    fetch: (url, opts = {}) => fetch(url, { ...opts, cache: 'no-store' }),
  },
  auth: {
    persistSession: true,
    storageKey: 'sullivan-parks-auth',
  },
})
// end of file
