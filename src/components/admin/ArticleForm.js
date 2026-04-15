// src/components/admin/ArticleForm.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const inp = 'w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm text-[#0A2342] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'
const lbl = 'block text-xs font-semibold text-gray-600 mb-1'
function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

export default function ArticleForm({ row, table, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:     row?.title     ?? '',
    slug:      row?.slug      ?? '',
    excerpt:   row?.excerpt   ?? '',
    body:      row?.body      ?? '',
    author:    row?.author    ?? 'Sullivan Parks & Rec',
    published: row?.published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      published_at: form.published ? (row?.published_at ?? new Date().toISOString()) : null,
    }
    if (row?.id) { await supabase.from(table).update(payload).eq('id',row.id) }
    else          { await supabase.from(table).insert(payload) }
    setSaving(false); onSave()
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <h2 className="font-playfair text-lg text-[#0A2342]">{row?'Edit Article':'New Article'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Title *</label><input required className={inp} value={form.title} onChange={e=>{set('title',e.target.value);set('slug',slugify(e.target.value))}}/></div>
        <div><label className={lbl}>Author</label><input className={inp} value={form.author} onChange={e=>set('author',e.target.value)}/></div>
      </div>
      <div><label className={lbl}>Excerpt (shown on home page)</label><textarea rows={2} className={inp+' resize-none'} value={form.excerpt} onChange={e=>set('excerpt',e.target.value)}/></div>
      <div><label className={lbl}>Body (HTML or plain text)</label><textarea rows={8} className={inp+' resize-none font-mono text-xs'} placeholder="<p>Article content here…</p>" value={form.body} onChange={e=>set('body',e.target.value)}/></div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} className="w-4 h-4 accent-[#1565C0]"/>
        Published (sets published_at to now if new)
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-[#1565C0] text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-60">{saving?'Saving…':'Save'}</button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-500 px-3">Cancel</button>
      </div>
    </form>
  )
}
// end of file
