// src/components/admin/ParkForm.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

export default function ParkForm({ row, table, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:        row?.name        ?? '',
    slug:        row?.slug        ?? '',
    description: row?.description ?? '',
    amenities:   row?.amenities?.join(', ') ?? '',
    address:     row?.address     ?? '',
    hours:       row?.hours       ?? '',
    published:   row?.published   ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  async function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean),
    }
    if (row?.id) {
      await supabase.from(table).update(payload).eq('id', row.id)
    } else {
      await supabase.from(table).insert(payload)
    }
    setSaving(false); onSave()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <h2 className="font-playfair text-lg text-[#0A2342]">{row ? 'Edit Park' : 'New Park'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Name *</label><input required className={inp} value={form.name} onChange={e=>{set('name',e.target.value);set('slug',slugify(e.target.value))}}/></div>
        <div><label className={lbl}>Slug</label><input className={inp} value={form.slug} onChange={e=>set('slug',e.target.value)}/></div>
      </div>
      <div><label className={lbl}>Description</label><textarea rows={3} className={inp+' resize-none'} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div><label className={lbl}>Amenities (comma-separated)</label><input className={inp} placeholder="Parking, Picnic Tables, Restrooms" value={form.amenities} onChange={e=>set('amenities',e.target.value)}/></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Address</label><input className={inp} value={form.address} onChange={e=>set('address',e.target.value)}/></div>
        <div><label className={lbl}>Hours</label><input className={inp} placeholder="Open year-round, dawn to dusk" value={form.hours} onChange={e=>set('hours',e.target.value)}/></div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} className="w-4 h-4 accent-[#1565C0]"/>
        Published (visible on public site)
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-[#1565C0] text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-3">Cancel</button>
      </div>
    </form>
  )
}
// end of file
