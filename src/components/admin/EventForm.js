// src/components/admin/EventForm.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'
const categories = ['Volunteer','Recreation','Programs','Community','General']

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

// Append Eastern offset directly to the datetime-local string so parsing is unambiguous
function easternToUTC(localStr) {
  if (!localStr) return null
  const month = parseInt(localStr.slice(5, 7), 10)
  const offset = (month >= 3 && month <= 11) ? '-04:00' : '-05:00'  // EDT / EST
  return new Date(localStr + offset).toISOString()
}

// Convert UTC timestamp to Eastern for the datetime-local input
function utcToEastern(ts) {
  if (!ts) return ''
  const s = new Date(ts).toLocaleString('sv-SE', { timeZone: TZ })
  return s.slice(0, 16).replace(' ', 'T')
}

export default function EventForm({ row, table, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:       row?.title       ?? '',
    slug:        row?.slug        ?? '',
    description: row?.description ?? '',
    start_at:    utcToEastern(row?.start_at),
    end_at:      utcToEastern(row?.end_at),
    location:    row?.location    ?? '',
    category:    row?.category    ?? 'General',
    published:   row?.published   ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  async function save(e) {
    e.preventDefault(); setSaving(true)
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

  return (
    <form onSubmit={save} className="space-y-4">
      <h2 className="font-playfair text-lg text-[#0A2342]">{row ? 'Edit Event' : 'New Event'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Title *</label><input required className={inp} value={form.title} onChange={e=>{set('title',e.target.value);set('slug',slugify(e.target.value))}}/></div>
        <div><label className={lbl}>Category</label>
          <select className={inp} value={form.category} onChange={e=>set('category',e.target.value)}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div><label className={lbl}>Description</label><textarea rows={3} className={inp+' resize-none'} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Start date &amp; time *</label><input required type="datetime-local" className={inp} value={form.start_at} onChange={e=>set('start_at',e.target.value)}/></div>
        <div><label className={lbl}>End date &amp; time</label><input type="datetime-local" className={inp} value={form.end_at} onChange={e=>set('end_at',e.target.value)}/></div>
      </div>
      <div><label className={lbl}>Location</label><input className={inp} value={form.location} onChange={e=>set('location',e.target.value)}/></div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} className="w-4 h-4 accent-[#1565C0]"/>
        Published
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-[#1565C0] text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-60">{saving?'Saving…':'Save'}</button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 px-3">Cancel</button>
      </div>
    </form>
  )
}
// end of file
