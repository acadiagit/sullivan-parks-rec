// src/components/admin/EventForm.js
// Path: ~/coworker/parks/src/components/admin/EventForm.js
// Description: Event editor with rich body (HTML textarea + MediaPicker),
//              cover image picker, preview toggle, archive lifecycle,
//              AND a visual list of body media with one-click remove.
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'
import MediaPicker from './MediaPicker'
import {
  Image as ImageIcon, Paperclip, Eye, Pencil, Archive, RotateCcw,
  FileText, Video as VideoIcon, Link as LinkIcon, X,
} from 'lucide-react'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'
const categories = ['Volunteer','Recreation','Programs','Community','General']

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

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

// ─── Body media parsing/removal ───────────────────────────────────────
// Parses the body HTML and extracts a list of inserted media (img/a/video/iframe).
// Returns [{ type, url, label }, ...]. Returns [] on server or when body is empty.
function parseBodyMedia(body) {
  if (!body || typeof window === 'undefined') return []
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${body}</div>`, 'text/html')
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

// Removes the first matching media element from the body string and returns the new HTML.
function removeMediaFromBody(body, type, url) {
  if (!body || typeof window === 'undefined') return body
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${body}</div>`, 'text/html')
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

    // Trim leading/trailing whitespace and collapse blank lines
    return root.innerHTML.replace(/\n{3,}/g, '\n\n').trim()
  } catch (e) {
    console.error('removeMediaFromBody failed:', e)
    return body
  }
}

const TYPE_ICON = { image: ImageIcon, document: FileText, video: VideoIcon, link: LinkIcon }

export default function EventForm({ row, table, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:           row?.title           ?? '',
    slug:            row?.slug            ?? '',
    description:     row?.description     ?? '',
    body:            row?.body            ?? '',
    cover_image_url: row?.cover_image_url ?? '',
    start_at:        utcToEastern(row?.start_at),
    end_at:          utcToEastern(row?.end_at),
    location:        row?.location        ?? '',
    category:        row?.category        ?? 'General',
    published:       row?.published       ?? true,
    archived_at:     row?.archived_at     ?? null,
  })
  const [saving, setSaving]           = useState(false)
  const [pickerMode, setPickerMode]   = useState(null)  // null | 'body' | 'cover'
  const [previewing, setPreviewing]   = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const isArchived = !!form.archived_at
  const bodyMedia  = parseBodyMedia(form.body)

  function insertBodyMedia(html) {
    setForm(f => ({ ...f, body: f.body + '\n' + html }))
  }
  function selectCoverUrl(url) {
    setForm(f => ({ ...f, cover_image_url: url }))
  }
  function removeBodyMediaItem(item) {
    if (!confirm(`Remove this ${item.type} from the event body?\n\n${item.label || item.url}`)) return
    setForm(f => ({ ...f, body: removeMediaFromBody(f.body, item.type, item.url) }))
  }

  async function save(e) {
    e?.preventDefault?.()
    setSaving(true)
    const payload = {
      ...form,
      slug:     form.slug || slugify(form.title),
      start_at: easternToUTC(form.start_at),
      end_at:   easternToUTC(form.end_at),
    }
    if (row?.id) { await supabase.from(table).update(payload).eq('id', row.id) }
    else          { await supabase.from(table).insert(payload) }
    setSaving(false); onSave()
  }

  async function archiveNow() {
    if (!row?.id) return
    if (!confirm('Archive this event? It will be hidden from public listings.')) return
    const now = new Date().toISOString()
    await supabase.from(table).update({ archived_at: now, published: false }).eq('id', row.id)
    onSave()
  }

  async function restoreFromArchive() {
    if (!row?.id) return
    await supabase.from(table).update({ archived_at: null }).eq('id', row.id)
    onSave()
  }

  // ── Preview render — mirrors public /events/[slug]/page.js styling ───
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
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt={form.title}
                 className="w-full max-h-80 object-cover"/>
          )}
          <div className="p-6 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#27A844]">{form.category}</div>
            <h1 className="font-playfair text-3xl text-[#0A2342]">{form.title || '(untitled)'}</h1>
            {form.start_at && (
              <p className="text-sm text-gray-500">
                {formatEastern(easternToUTC(form.start_at))}
                {form.end_at && <> → {formatEastern(easternToUTC(form.end_at))}</>}
              </p>
            )}
            {form.location && <p className="text-sm text-gray-600">📍 {form.location}</p>}
            {form.description && <p className="text-sm text-gray-700 italic">{form.description}</p>}
            {form.body && (
              <div className="prose prose-sm max-w-none text-[#0A2342]"
                   dangerouslySetInnerHTML={{__html: form.body}}/>
            )}
          </div>
        </article>
        <p className="text-xs text-gray-400 italic">
          Preview is approximate. Final styling may differ slightly on the live page.
        </p>
      </div>
    )
  }

  // ── Edit mode ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-playfair text-lg text-[#0A2342]">{row ? 'Edit Event' : 'New Event'}</h2>
        {isArchived && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded">
            <Archive size={11}/> Archived
          </span>
        )}
      </div>

      {/* Title / Category */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Title *</label>
          <input required className={inp} value={form.title}
                 onChange={e => { set('title', e.target.value); set('slug', slugify(e.target.value)) }}/>
        </div>
        <div>
          <label className={lbl}>Category</label>
          <select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Short description (used on list views) */}
      <div>
        <label className={lbl}>Short description (one-liner shown on list views)</label>
        <textarea rows={2} className={inp+' resize-none'} value={form.description}
                  onChange={e => set('description', e.target.value)}/>
      </div>

      {/* Cover image */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={lbl} style={{margin:0}}>Cover image</label>
          <button type="button" onClick={() => setPickerMode('cover')}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#1565C0] text-[#1565C0] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#1565C0] hover:text-white transition-colors">
            <ImageIcon size={13}/> {form.cover_image_url ? 'Change' : 'Pick'} cover
          </button>
        </div>
        {form.cover_image_url ? (
          <div className="relative inline-block">
            <img src={form.cover_image_url} alt="cover preview"
                 className="max-h-32 rounded-lg border border-[#EAF0FA]"/>
            <button type="button" onClick={() => set('cover_image_url', '')}
                    className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-600 text-xs">
              ✕
            </button>
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

        {/* Inserted-media tiles ABOVE the textarea */}
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
                      <div className="w-16 h-16 rounded-lg border border-[#EAF0FA] bg-white flex flex-col items-center justify-center gap-0.5 p-1 overflow-hidden"
                           title={item.label}>
                        <Icon size={18} className="text-[#1565C0]"/>
                        <span className="text-[7px] text-gray-600 leading-tight text-center break-all line-clamp-2">
                          {item.label?.slice(0, 24) || item.type}
                        </span>
                      </div>
                    )}
                    <button type="button" onClick={() => removeBodyMediaItem(item)}
                            title="Remove from body"
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
                  placeholder="<p>Event details, schedule, links to flyers, etc.</p>"
                  value={form.body} onChange={e => set('body', e.target.value)}/>
      </div>

      {/* Dates */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Start date &amp; time *</label>
          <input required type="datetime-local" className={inp} value={form.start_at}
                 onChange={e => set('start_at', e.target.value)}/>
        </div>
        <div>
          <label className={lbl}>End date &amp; time</label>
          <input type="datetime-local" className={inp} value={form.end_at}
                 onChange={e => set('end_at', e.target.value)}/>
        </div>
      </div>

      <div>
        <label className={lbl}>Location</label>
        <input className={inp} value={form.location} onChange={e => set('location', e.target.value)}/>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)}
               className="w-4 h-4 accent-[#1565C0]"/>
        Published
      </label>

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

      {/* Picker mounted as overlay when needed */}
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
