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
    .select('*, parks(id, name, slug, address, lat, lng)')
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
    .select('*, parks(id, name, slug)')
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
    .select('*, parks(id, name, slug)')

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
    .select('*, parks(id, name, slug)')
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

// ── Display helpers ────────────────────────────────────────

const DOW   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Format a date/time for human display. Falls back to '' for null/invalid input.
 * Formats:
 *   'long'      → 'Tue, Jun 9, 2026 · 2:30 PM'   (default)
 *   'date'      → 'Tue, Jun 9, 2026'
 *   'time'      → '2:30 PM'
 *   'short'     → 'Jun 9 · 2:30 PM'
 *   'iso-date'  → '2026-06-09'                    (machine-readable, e.g., for <input type="date">)
 */
export function formatDate(input, format = 'long') {
  if (!input) return ''
  const d = input instanceof Date ? input : new Date(input)
  if (isNaN(d)) return ''

  const dow   = DOW[d.getDay()]
  const month = MONTH[d.getMonth()]
  const day   = d.getDate()
  const year  = d.getFullYear()

  let hours = d.getHours()
  const mins = d.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const time = `${hours}:${String(mins).padStart(2, '0')} ${ampm}`

  switch (format) {
    case 'date':     return `${dow}, ${month} ${day}, ${year}`
    case 'time':     return time
    case 'short':    return `${month} ${day} · ${time}`
    case 'iso-date': return d.toISOString().slice(0, 10)
    case 'long':
    default:         return `${dow}, ${month} ${day}, ${year} · ${time}`
  }
}

/**
 * Format a date range (e.g., for events spanning multiple days).
 * Examples:
 *   formatDateRange('2026-06-12T10:00', '2026-06-14T16:00')
 *     → 'Fri–Sun, Jun 12–14, 2026'
 *   formatDateRange('2026-06-09T10:00', '2026-06-09T14:00')
 *     → 'Tue, Jun 9, 2026 · 10:00 AM – 2:00 PM'
 *   formatDateRange('2026-06-09T10:00', null)
 *     → 'Tue, Jun 9, 2026 · 10:00 AM'
 */
export function formatDateRange(startInput, endInput) {
  if (!startInput) return ''
  const start = new Date(startInput)
  if (isNaN(start)) return ''

  if (!endInput) return formatDate(start, 'long')

  const end = new Date(endInput)
  if (isNaN(end)) return formatDate(start, 'long')

  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return `${formatDate(start, 'date')} · ${formatDate(start, 'time')} – ${formatDate(end, 'time')}`
  }

  // Multi-day. Compact form: "Fri–Sun, Jun 12–14, 2026" when same month/year.
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) {
    const dowStart = DOW[start.getDay()]
    const dowEnd   = DOW[end.getDay()]
    return `${dowStart}–${dowEnd}, ${MONTH[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }

  // Different months — spell each side out
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
