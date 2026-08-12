// content.js
// Path: src/lib/content.js
// Desc: Shared helpers for unified content (events, programs, news, park_info).
//       All reads/writes hit the `content` table. Formatting helpers for display.
// ============================================================
import { supabase } from '@/lib/supabase'

// ── Type constants ─────────────────────────────────────────
export const CONTENT_TYPES = {
  EVENT:     'event',
  PROGRAM:   'program',
  NEWS:      'news',
  PARK_INFO: 'park_info',
  PROJECT:   'project',
}

// ── Reads ──────────────────────────────────────────────────

/**
 * Fetch a single content record by type + slug.
 * Returns null if not found or archived (mirrors Phase 1 "skip archived" behavior).
 *
 *   const event = await getContent({ type: 'event', slug: 'bike-rodeo' })
 */
export async function getContent({ type, slug, includeArchived = false }) {
  let query = supabase
    .from('content')
    .select('*')
    .eq('type', type)
    .eq('slug', slug)

  if (!includeArchived) {
    query = query.eq('status', 'published')
  }

  const { data, error } = await query.single()
  if (error) return null
  return data
}

/**
 * Fetch a single content record by id (admin context).
 * Always returns archived records too — admin needs to see them.
 *
 *   const item = await getContentById(7)
 */
export async function getContentById(id) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

/**
 * List content records by type, with sensible defaults.
 *
 *   const upcoming = await listContent({ type: 'event' })
 *   const archived = await listContent({ type: 'event', status: 'archived' })
 *   const allEvents = await listContent({ type: 'event', status: null })
 */
export async function listContent({
  type,
  status = 'published',
  parkId = null,
  limit = null,
  orderBy = 'created_at',
  ascending = false,
} = {}) {
  let query = supabase
    .from('content')
    .select('*')

  if (type)   query = query.eq('type', type)
  if (status) query = query.eq('status', status)
  if (parkId) query = query.eq('park_id', parkId)

  query = query.order(orderBy, { ascending })
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) {
    console.error('listContent error:', error)
    return []
  }
  return data || []
}

/**
 * Upcoming events/programs — convenience over listContent
 * with a start_at >= now filter, sorted soonest first.
 */
export async function listUpcoming({ type = 'event', limit = null } = {}) {
  let query = supabase
    .from('content')
    .select('*')
    .eq('type', type)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })

  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) {
    console.error('listUpcoming error:', error)
    return []
  }
  return data || []
}

/**
 * Full-text search across all published content (any type).
 * Delegates ranking + matching to the search_content() Postgres function
 * (see db/phase3-search.sql) so search logic stays in one place with the data.
 * Returns ranked rows (most relevant first); [] on empty query or error.
 *
 *   const hits = await searchContent('kayak ramp')
 */
export async function searchContent(rawQuery) {
  const query = (rawQuery || '').trim()
  if (!query) return []
  const { data, error } = await supabase.rpc('search_content', { query })
  if (error) {
    console.error('searchContent error:', error)
    return []
  }
  return data || []
}

// ── Writes (admin) ─────────────────────────────────────────

/**
 * Create or update a content record.
 * If `record.id` is present → update; otherwise → insert.
 * Returns the saved record (with id) on success, null on error.
 */
export async function upsertContent(record) {
  // Always bump updated_at; created_at preserved on existing rows
  const payload = { ...record, updated_at: new Date().toISOString() }

  let result
  if (record.id) {
    result = await supabase
      .from('content')
      .update(payload)
      .eq('id', record.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from('content')
      .insert(payload)
      .select()
      .single()
  }

  if (result.error) {
    console.error('upsertContent error:', result.error)
    return null
  }
  return result.data
}

/**
 * Archive a content record (soft delete).
 * Sets status='archived' and archived_at=now.
 */
export async function archiveContent(id) {
  const { data, error } = await supabase
    .from('content')
    .update({
      status:      'archived',
      archived_at: new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('archiveContent error:', error)
    return null
  }
  return data
}

/**
 * Un-archive a content record.
 * Sets status='published', clears archived_at.
 */
export async function restoreContent(id) {
  const { data, error } = await supabase
    .from('content')
    .update({
      status:      'published',
      archived_at: null,
      updated_at:  new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('restoreContent error:', error)
    return null
  }
  return data
}

// ── Park/asset links (many-to-many via content_parks) ──────

/**
 * Fetch the park/asset ids linked to a content item.
 *
 *   const ids = await getLinkedParkIds(20)   // → [23]
 */
export async function getLinkedParkIds(contentId) {
  if (!contentId) return []
  const { data, error } = await supabase
    .from('content_parks')
    .select('park_id')
    .eq('content_id', contentId)
  if (error) {
    console.error('getLinkedParkIds error:', error)
    return []
  }
  return (data || []).map(r => r.park_id)
}

/**
 * Replace all park/asset links for a content item with the given list.
 * Diffs against current links so only the actual add/remove rows are
 * written — calling this with the same list twice is a no-op on the 2nd call.
 * Returns true on success, false if any write failed.
 *
 *   await setLinkedParks(20, [23, 24])
 */
export async function setLinkedParks(contentId, parkIds) {
  if (!contentId) return false
  const existing = await getLinkedParkIds(contentId)
  const toAdd    = parkIds.filter(id => !existing.includes(id))
  const toRemove = existing.filter(id => !parkIds.includes(id))

  if (toRemove.length) {
    const { error } = await supabase
      .from('content_parks')
      .delete()
      .eq('content_id', contentId)
      .in('park_id', toRemove)
    if (error) {
      console.error('setLinkedParks remove error:', error)
      return false
    }
  }
  if (toAdd.length) {
    const { error } = await supabase
      .from('content_parks')
      .insert(toAdd.map(park_id => ({ content_id: contentId, park_id })))
    if (error) {
      console.error('setLinkedParks add error:', error)
      return false
    }
  }
  return true
}

/**
 * Permanently delete a content record and its park/asset links.
 * Irreversible — unlike archiveContent, there is no restore path.
 * Only call this on already-archived rows from the UI.
 *
 *   await purgeContent(20)
 */
export async function purgeContent(id) {
  if (!id) return false
  // content_parks has a FK to content.id — clean up links first
  await supabase.from('content_parks').delete().eq('content_id', id)
  const { error } = await supabase.from('content').delete().eq('id', id)
  if (error) {
    console.error('purgeContent error:', error)
    return false
  }
  return true
}

// ── Display helpers ────────────────────────────────────────
// All formatters are TZ-aware via TZ from @/lib/config (America/New_York).
// Visual output is uniform across all callers — single source of truth.
import { TZ } from '@/lib/config'

/**
 * Format a date/time for human display in Eastern Time.
 * Returns '' for null/invalid input.
 * Formats:
 *   'long'      → 'Tue, June 10, 2026 · 2:30 PM'      (default — detail pages)
 *   'date'      → 'Tue, June 10, 2026'                (card date corner)
 *   'time'      → '2:30 PM'                           (card bottom row)
 *   'short'     → 'Jun 10 · 2:30 PM'                  (calendar, tight spaces)
 *   'iso-date'  → '2026-06-10'                        (machine-readable)
 */
export function formatDate(input, format = 'long') {
  if (!input) return ''
  const d = input instanceof Date ? input : new Date(input)
  if (isNaN(d)) return ''

  if (format === 'iso-date') return d.toISOString().slice(0, 10)

  const dateLong  = d.toLocaleDateString('en-US', {
    timeZone: TZ, weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  })
  const dateShort = d.toLocaleDateString('en-US', {
    timeZone: TZ, month: 'short', day: 'numeric',
  })
  const time      = d.toLocaleTimeString('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit',
  })

  switch (format) {
    case 'date':  return dateLong
    case 'time':  return time
    case 'short': return `${dateShort} · ${time}`
    case 'long':
    default:      return `${dateLong} · ${time}`
  }
}

/**
 * Format a date range for human display.
 * Examples (all Eastern Time):
 *   formatDateRange('2026-06-12T14:00Z', '2026-06-14T20:00Z')
 *     → 'Fri, June 12 – Sun, June 14, 2026'
 *   formatDateRange('2026-06-10T14:00Z', '2026-06-10T18:00Z')
 *     → 'Tue, June 10, 2026 · 10:00 AM – 2:00 PM'
 *   formatDateRange('2026-06-10T14:00Z', null)
 *     → 'Tue, June 10, 2026 · 10:00 AM'
 */
export function formatDateRange(startInput, endInput) {
  if (!startInput) return ''
  const start = new Date(startInput)
  if (isNaN(start)) return ''

  if (!endInput) return formatDate(start, 'long')

  const end = new Date(endInput)
  if (isNaN(end)) return formatDate(start, 'long')

  // Compare day in Eastern Time (not server-local time)
  const startKey = start.toLocaleDateString('en-US', { timeZone: TZ })
  const endKey   = end  .toLocaleDateString('en-US', { timeZone: TZ })
  const sameDay  = startKey === endKey

  if (sameDay) {
    return `${formatDate(start, 'date')} · ${formatDate(start, 'time')} – ${formatDate(end, 'time')}`
  }

  // Multi-day. Compact form when same year.
  const startYear = start.toLocaleDateString('en-US', { timeZone: TZ, year: 'numeric' })
  const endYear   = end  .toLocaleDateString('en-US', { timeZone: TZ, year: 'numeric' })
  if (startYear === endYear) {
    const startShort = start.toLocaleDateString('en-US', {
      timeZone: TZ, weekday: 'short', month: 'long', day: 'numeric',
    })
    const endShort   = end.toLocaleDateString('en-US', {
      timeZone: TZ, weekday: 'short', month: 'long', day: 'numeric',
    })
    return `${startShort} – ${endShort}, ${endYear}`
  }

  // Different years — spell each side fully
  return `${formatDate(start, 'date')} – ${formatDate(end, 'date')}`
}

/**
 * Slugify a string for use as a URL slug.
 * Examples:
 *   slugify("Sullivan Daze 2026") → "sullivan-daze-2026"
 *   slugify("O'Keefe's Park")     → "okeefes-park"
 */
export function slugify(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')           // strip apostrophes
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanumeric → dash
    .replace(/^-+|-+$/g, '')         // trim leading/trailing dashes
}

// end of file
