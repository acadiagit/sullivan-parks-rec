// src/components/admin/ProjectForm.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'
const statuses = ['Planned','In Progress','Completed']
function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

export default function ProjectForm({ row, table, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:        row?.title        ?? '',
    slug:         row?.slug         ?? '',
    description:  row?.description  ?? '',
    status:       row?.status       ?? 'Planned',
    progress_pct: row?.progress_pct ?? 0,
    year:         row?.year         ?? new Date().getFullYear().toString(),
    published:    row?.published    ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = {...form, slug:form.slug||slugify(form.title), progress_pct:Number(form.progress_pct)}
    if (row?.id) { await supabase.from(table).update(payload).eq('id',row.id) }
    else          { await supabase.from(table).insert(payload) }
    setSaving(false); onSave()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <h2 className="font-playfair text-lg text-[#0A2342]">{row?'Edit Project':'New Project'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Title *</label><input required className={inp} value={form.title} onChange={e=>{set('title',e.target.value);set('slug',slugify(e.target.value))}}/></div>
        <div><label className={lbl}>Year</label><input className={inp} value={form.year} onChange={e=>set('year',e.target.value)}/></div>
      </div>
      <div><label className={lbl}>Description</label><textarea rows={3} className={inp+' resize-none'} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Status</label><select className={inp} value={form.status} onChange={e=>set('status',e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label className={lbl}>Progress % (0–100)</label><input type="number" min="0" max="100" className={inp} value={form.progress_pct} onChange={e=>set('progress_pct',e.target.value)}/></div>
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
