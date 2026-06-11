// ContentForm.js
// Path: ~/coworker/parks/src/components/admin/ContentForm.js
// Description: Unified editor for content (event, program, news, park_info).
//              Same shell as EventForm but field visibility driven by `type` prop.
//              Type-specific fields go into the JSONB `extras` column.
//              Category picker hidden for all types (showCategory:false) — rows
//              default to 'community'. Re-enable by flipping showCategory back.
// ============================================================
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'
import {
  upsertContent, archiveContent, restoreContent, slugify,
} from '@/lib/content'
import MediaPicker from './MediaPicker'
import {
  Image as ImageIcon, Paperclip, Eye, Pencil, Archive, RotateCcw,
  FileText, Video as VideoIcon, Link as LinkIcon, X,
} from 'lucide-react'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'

// ── Per-type configuration ────────────────────────────────────
// Each type declares which sections appear and what type-specific
// `extras` fields it needs.
// NOTE: showCategory is false everywhere — categories are hidden from the UI
// until the organization grows. The `categories` arrays are retained so
// flipping showCategory back to true fully restores the picker.
const TYPE_CONFIG = {
  event: {
    label:        'Event',
    showCategory: false,
    showDates:    true,
    showLocation: true,
    showPark:     true,
    parkRequired: false,
    categories:   ['Volunteer','Recreation','Programs','Community','General'],
    extras:       [],
  },
  program: {
    label:        'Program',
    showCategory: false,
    showDates:    true,
    showLocation: true,
    showPark:     true,
    parkRequired: false,
    categories:   ['Sports','Camps','Classes','Youth','Adult','General'],
    extras: [
      { key: 'schedule_text',    label: 'Weekly schedule',  type: 'text',   placeholder: 'Mon/Wed 6:00 pm' },
      { key: 'age_range',        label: 'Age range',        type: 'text',   placeholder: '8–14' },
      { key: 'fee_cents',        label: 'Fee (cents)',      type: 'number', placeholder: '5000 = $50.00' },
      { key: 'registration_url', label: 'Registration URL', type: 'url',    placeholder: 'https://…' },
    ],
  },
  news: {
    label:        'News',
    showCategory: false,
    showDates:    false,
    showLocation: false,
    showPark:     false,
    parkRequired: false,
    categories:   ['Announcement','Press','Update','General'],
    extras: [
      { key: 'publish_date', label: 'Publish date', type: 'date' },
      { key: 'author',       label: 'Author',       type: 'text', placeholder: 'Hugo Diaz' },
    ],
  },
  park_info: {
    label:        'Park Info Page',
    showCategory: false,
    showDates:    false,
    showLocation: false,
    showPark:     true,
    parkRequired: true,
    categories:   [],
    extras:       [],
  },
  project: {
    label:        'Project',
    showCategory: false,
    showDates:    false,
    showLocation: false,
    showPark:     true,
    parkRequired: false,
    categories:   [],
    extras: [
      { key: 'project_status', label: 'Status',          type: 'select', options: ['Planned', 'In Progress', 'Completed'], placeholder: 'Planned' },
      { key: 'progress_pct',   label: 'Progress (%)',    type: 'number', placeholder: '0–100' },
      { key: 'year',           label: 'Year',            type: 'number', placeholder: String(new Date().getFullYear()) },
      { key: 'budget_cents',   label: 'Budget (cents)',  type: 'number', placeholder: 'optional' },
    ],
  },
}

// ── Timezone helpers (datetime-local has no TZ awareness) ─────
function easternToUTC(localStr) {
  if (!localStr) return null
  const month = parseInt(localStr.slice(5, 7), 10)
  const offset = (month >= 3 && month <= 11) ? '-04:00' : '-05:00'
  return new Date(localStr + offset).toISOString()
}
function utcToEastern(ts) {
  if (!ts) return ''
  const s = new Date(ts).toLocaleString('sv-SE', { timeZone: TZ })
  return s.slice(0, 16).replace(' ', 'T')
}
function formatEastern(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('en-US', { timeZone: TZ, dateStyle: 'full', timeStyle: 'short' })
}

// ── Body media: parse + selective remove ──────────────────────
function parseBodyMedia(body) {
  if (!body || typeof window === 'undefined') return []
  try {
    const doc = new DOMParser().parseFromString(`<div>${body}</div>`, 'text/html')
    const root = doc.body.firstChild
    const items = []
    root.querySelectorAll('img').forEach(el => {
      const src = el.getAttribute('src') || ''
      items.push({ type: 'image', url: src, label: el.getAttribute('alt') || src.split('/').pop() })
    })
    root.querySelectorAll('a').forEach(el => {
      const href = el.getAttribute('href') || ''
      const text = (el.textContent || '').trim()
      const isDoc = text.startsWith('📄') || /\.(pdf|docx?|txt)$/i.test(href)
      items.push({ type: isDoc ? 'document' : 'link', url: href, label: text || href })
    })
    root.querySelectorAll('video').forEach(el => {
      const src = el.getAttribute('src') || ''
      items.push({ type: 'video', url: src, label: src.split('/').pop() })
    })
    root.querySelectorAll('iframe').forEach(el => {
      const src = el.getAttribute('src') || ''
      items.push({ type: 'video', url: src, label: 'Video embed' })
    })
    return items
  } catch (e) {
    console.error('parseBodyMedia failed:', e)
    return []
  }
}
function removeMediaFromBody(body, type, url) {
  if (!body || typeof window === 'undefined') return body
  try {
    const doc = new DOMParser().parseFromString(`<div>${body}</div>`, 'text/html')
    const root = doc.body.firstChild
    let target = null
    if (type === 'image') {
      target = root.querySelector(`img[src="${url}"]`)
    } else if (type === 'document' || type === 'link') {
      target = root.querySelector(`a[href="${url}"]`)
    } else if (type === 'video') {
      target = root.querySelector(`video[src="${url}"]`)
      if (!target) {
        const iframe = root.querySelector(`iframe[src="${url}"]`)
        if (iframe) target = iframe.closest('div') || iframe
      }
    }
    if (target) target.remove()
    return root.innerHTML.replace(/\n{3,}/g, '\n\n').trim()
  } catch (e) {
    console.error('removeMediaFromBody failed:', e)
    return body
  }
}
const TYPE_ICON = { image: ImageIcon, document: FileText, video: VideoIcon, link: LinkIcon }

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function ContentForm({ row, type = 'event', onSave, onCancel }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.event

  const [form, setForm] = useState({
    title:       row?.title       ?? '',
    slug:        row?.slug        ?? '',
    summary:     row?.summary     ?? '',
    body_html:   row?.body_html   ?? '',
    cover_url:   row?.cover_url   ?? '',
    category:    row?.category    ?? (cfg.categories[0] || 'General'),
    start_at:    utcToEastern(row?.start_at),
    end_at:      utcToEastern(row?.end_at),
    location:    row?.location    ?? '',
    park_id:     row?.park_id     ?? null,
    status:      row?.status      ?? 'published',
    archived_at: row?.archived_at ?? null,
    extras:      row?.extras      ?? {},
  })

  const [parks, setParks]         = useState([])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [pickerMode, setPickerMode] = useState(null)
  const [previewing, setPreviewing] = useState(false)

  const set      = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setExtra = (k, v) => setForm(f => ({ ...f, extras: { ...f.extras, [k]: v } }))

  // Load parks list when needed
  useEffect(() => {
    if (!cfg.showPark) return
    supabase
      .from('parks')
      .select('id, name, slug')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .then(({ data }) => setParks(data || []))
  }, [cfg.showPark])

  const isArchived = form.status === 'archived'
  const bodyMedia  = parseBodyMedia(form.body_html)

  function insertBodyMedia(html) {
    setForm(f => ({ ...f, body_html: f.body_html + '\n' + html }))
  }
  function selectCoverUrl(url) { set('cover_url', url) }
  function removeBodyMediaItem(item) {
    if (!confirm(`Remove this ${item.type} from the body?\n\n${item.label || item.url}`)) return
    setForm(f => ({ ...f, body_html: removeMediaFromBody(f.body_html, item.type, item.url) }))
  }

  async function save(e) {
    e?.preventDefault?.()
    setError(null)

    if (cfg.parkRequired && !form.park_id) {
      setError('Please choose a park for this info page.')
      return
    }

    setSaving(true)
    const payload = {
      type,
      title:     form.title,
      slug:      form.slug || slugify(form.title),
      summary:   form.summary || null,
      body_html: form.body_html || null,
      cover_url: form.cover_url || null,
      category:  cfg.showCategory ? form.category : 'community',  // hidden → default 'community'
      park_id:   cfg.showPark     ? form.park_id  : null,
      start_at:  cfg.showDates    ? easternToUTC(form.start_at) : null,
      end_at:    cfg.showDates    ? easternToUTC(form.end_at)   : null,
      location:  cfg.showLocation ? (form.location || null)     : null,
      status:    form.status,
      extras:    form.extras || {},
    }
    if (row?.id) payload.id = row.id

    const result = await upsertContent(payload)
    setSaving(false)
    if (result) onSave()
    else setError('Save failed. Check console for details.')
  }

  async function archiveNow() {
    if (!row?.id) return
    if (!confirm(`Archive this ${cfg.label.toLowerCase()}? It will be hidden from public listings.`)) return
    const result = await archiveContent(row.id)
    if (result) onSave()
  }
  async function restoreFromArchive() {
    if (!row?.id) return
    const result = await restoreContent(row.id)
    if (result) onSave()
  }

  // ── Preview render ────────────────────────────────────────
  if (previewing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EAF0FA]">
          <h2 className="font-playfair text-lg text-[#0A2342]">Preview</h2>
          <button type="button" onClick={() => setPreviewing(false)}
                  className="inline-flex items-center gap-1.5 bg-[#1565C0] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#0A2342] transition-colors">
            <Pencil size={13}/> Back to edit
          </button>
        </div>
        <article className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {form.cover_url && (
            <img src={form.cover_url} alt={form.title}
                 className="w-full max-h-80 object-cover"/>
          )}
          <div className="p-6 space-y-4">
            {cfg.showCategory && form.category && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#27A844]">{form.category}</div>
            )}
            <h1 className="font-playfair text-3xl text-[#0A2342]">{form.title || '(untitled)'}</h1>
            {cfg.showDates && form.start_at && (
              <p className="text-sm text-gray-500">
                {formatEastern(easternToUTC(form.start_at))}
                {form.end_at && <> → {formatEastern(easternToUTC(form.end_at))}</>}
              </p>
            )}
            {cfg.showLocation && form.location && <p className="text-sm text-gray-600">📍 {form.location}</p>}
            {form.summary && <p className="text-sm text-gray-700 italic">{form.summary}</p>}
            {form.body_html && (
              <div className="prose prose-sm max-w-none text-[#0A2342]"
                   dangerouslySetInnerHTML={{__html: form.body_html}}/>
            )}
          </div>
        </article>
        <p className="text-xs text-gray-400 italic">Preview is approximate. Final styling may differ slightly on the live page.</p>
      </div>
    )
  }

  // ── Edit mode ─────────────────────────────────────────────
  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-lg text-[#0A2342]">
          {row ? `Edit ${cfg.label}` : `New ${cfg.label}`}
        </h2>
        {isArchived && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded">
            <Archive size={11}/> Archived
          </span>
        )}
      </div>

      {/* Title + optional Category */}
      <div className={`grid gap-4 ${cfg.showCategory ? 'sm:grid-cols-2' : ''}`}>
        <div>
          <label className={lbl}>Title *</label>
          <input required className={inp} value={form.title}
                 onChange={e => { set('title', e.target.value); set('slug', slugify(e.target.value)) }}/>
        </div>
        {cfg.showCategory && (
          <div>
            <label className={lbl}>Category</label>
            <select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
              {cfg.categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Optional Park selector */}
      {cfg.showPark && (
        <div>
          <label className={lbl}>Park{cfg.parkRequired ? ' *' : ''}</label>
          <select className={inp} value={form.park_id ?? ''}
                  onChange={e => set('park_id', e.target.value ? Number(e.target.value) : null)}
                  required={cfg.parkRequired}>
            <option value="">{cfg.parkRequired ? '— Choose a park —' : '— None / not linked to a park —'}</option>
            {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Summary */}
      <div>
        <label className={lbl}>Short summary (one-liner shown on list views)</label>
        <textarea rows={2} className={inp+' resize-none'} value={form.summary}
                  onChange={e => set('summary', e.target.value)}/>
      </div>

      {/* Cover image */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={lbl} style={{margin:0}}>Cover image</label>
          <button type="button" onClick={() => setPickerMode('cover')}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#1565C0] text-[#1565C0] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#1565C0] hover:text-white transition-colors">
            <ImageIcon size={13}/> {form.cover_url ? 'Change' : 'Pick'} cover
          </button>
        </div>
        {form.cover_url ? (
          <div className="relative inline-block">
            <img src={form.cover_url} alt="cover preview"
                 className="max-h-32 rounded-lg border border-[#EAF0FA]"/>
            <button type="button" onClick={() => set('cover_url', '')}
                    className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-600 text-xs">✕</button>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">No cover image selected.</div>
        )}
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={lbl} style={{margin:0}}>Body (HTML or plain text)</label>
          <button type="button" onClick={() => setPickerMode('body')}
                  className="inline-flex items-center gap-1.5 bg-[#1565C0] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#0A2342] transition-colors shadow-sm">
            <Paperclip size={13}/> Insert media
          </button>
        </div>

        {bodyMedia.length > 0 && (
          <div className="mb-2 p-3 bg-gray-50 border border-[#EAF0FA] rounded-lg">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">
              Inserted media ({bodyMedia.length}) — hover for remove
            </p>
            <div className="flex flex-wrap gap-2">
              {bodyMedia.map((item, i) => {
                const Icon = TYPE_ICON[item.type] || ImageIcon
                return (
                  <div key={`${item.type}-${item.url}-${i}`} className="relative group">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.label}
                           className="w-16 h-16 object-cover rounded-lg border border-[#EAF0FA] bg-white"/>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-[#EAF0FA] bg-white flex flex-col items-center justify-center gap-0.5 p-1 overflow-hidden" title={item.label}>
                        <Icon size={18} className="text-[#1565C0]"/>
                        <span className="text-[7px] text-gray-600 leading-tight text-center break-all line-clamp-2">
                          {item.label?.slice(0, 24) || item.type}
                        </span>
                      </div>
                    )}
                    <button type="button" onClick={() => removeBodyMediaItem(item)} title="Remove from body"
                            className="absolute -top-1.5 -right-1.5 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={11}/>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <textarea rows={10} className={inp+' resize-none font-mono text-xs'}
                  placeholder="<p>Details, schedule, links to flyers, etc.</p>"
                  value={form.body_html} onChange={e => set('body_html', e.target.value)}/>
      </div>

      {/* Dates */}
      {cfg.showDates && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Start date &amp; time{type === 'event' ? ' *' : ''}</label>
            <input required={type === 'event'} type="datetime-local" className={inp} value={form.start_at}
                   onChange={e => set('start_at', e.target.value)}/>
          </div>
          <div>
            <label className={lbl}>End date &amp; time</label>
            <input type="datetime-local" className={inp} value={form.end_at}
                   onChange={e => set('end_at', e.target.value)}/>
          </div>
        </div>
      )}

      {/* Location */}
      {cfg.showLocation && (
        <div>
          <label className={lbl}>Location</label>
          <input className={inp} value={form.location} onChange={e => set('location', e.target.value)}/>
        </div>
      )}

      {/* Type-specific extras (JSONB) */}
      {cfg.extras.length > 0 && (
        <div className="pt-2 border-t border-[#EAF0FA] space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {cfg.label} details
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {cfg.extras.map(ef => (
              <div key={ef.key}>
                <label className={lbl}>{ef.label}</label>
                {ef.type === 'select' ? (
                  <select
                    className={inp}
                    value={form.extras[ef.key] ?? ''}
                    onChange={e => setExtra(ef.key, e.target.value)}>
                    <option value="">— Choose —</option>
                    {(ef.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={ef.type}
                    className={inp}
                    placeholder={ef.placeholder || ''}
                    value={form.extras[ef.key] ?? ''}
                    onChange={e => setExtra(ef.key, e.target.value)}/>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EAF0FA]">
        <button type="submit" disabled={saving}
                className="bg-[#1565C0] text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => setPreviewing(true)}
                className="inline-flex items-center gap-1.5 bg-white border border-[#1565C0] text-[#1565C0] font-semibold text-sm px-4 py-2 rounded-full hover:bg-[#1565C0] hover:text-white transition-colors">
          <Eye size={14}/> Preview
        </button>
        {row?.id && !isArchived && (
          <button type="button" onClick={archiveNow}
                  className="inline-flex items-center gap-1.5 bg-white border border-amber-500 text-amber-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-amber-500 hover:text-white transition-colors">
            <Archive size={14}/> Archive
          </button>
        )}
        {row?.id && isArchived && (
          <button type="button" onClick={restoreFromArchive}
                  className="inline-flex items-center gap-1.5 bg-white border border-green-600 text-green-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-green-600 hover:text-white transition-colors">
            <RotateCcw size={14}/> Restore
          </button>
        )}
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 px-3 ml-auto">
          Cancel
        </button>
      </div>

      {pickerMode === 'body' && (
        <MediaPicker onInsert={(html) => { insertBodyMedia(html); setPickerMode(null) }}
                     onClose={() => setPickerMode(null)}/>
      )}
      {pickerMode === 'cover' && (
        <MediaPicker accept={['image']}
                     onSelectUrl={(url) => { selectCoverUrl(url); setPickerMode(null) }}
                     onClose={() => setPickerMode(null)}/>
      )}
    </form>
  )
}

// end of file
