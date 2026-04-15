// src/components/admin/ProgramForm.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'
const groups   = ['Youth','Adult','Senior','General']
const statuses = ['Open','Coming Soon','Full','Closed']
function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

export default function ProgramForm({ row, table, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:        row?.name        ?? '',
    slug:        row?.slug        ?? '',
    description: row?.description ?? '',
    group_label: row?.group_label ?? 'Youth',
    age_range:   row?.age_range   ?? '',
    season:      row?.season      ?? '',
    status:      row?.status      ?? 'Open',
    published:   row?.published   ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = {...form, slug:form.slug||slugify(form.name)}
    if (row?.id) { await supabase.from(table).update(payload).eq('id',row.id) }
    else          { await supabase.from(table).insert(payload) }
    setSaving(false); onSave()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <h2 className="font-playfair text-lg text-[#0A2342]">{row?'Edit Program':'New Program'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Name *</label><input required className={inp} value={form.name} onChange={e=>{set('name',e.target.value);set('slug',slugify(e.target.value))}}/></div>
        <div><label className={lbl}>Group</label><select className={inp} value={form.group_label} onChange={e=>set('group_label',e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></div>
      </div>
      <div><label className={lbl}>Description</label><textarea rows={3} className={inp+' resize-none'} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div><label className={lbl}>Age Range</label><input className={inp} placeholder="6–14" value={form.age_range} onChange={e=>set('age_range',e.target.value)}/></div>
        <div><label className={lbl}>Season</label><input className={inp} placeholder="June–August" value={form.season} onChange={e=>set('season',e.target.value)}/></div>
        <div><label className={lbl}>Status</label><select className={inp} value={form.status} onChange={e=>set('status',e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
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
