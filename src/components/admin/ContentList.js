// src/components/admin/ContentList.js
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

// Generic CRUD list for any content type
// Props: table, columns, labelField, onAdd, onEdit
export default function ContentList({ table, columns, labelField = 'name', addLabel = 'Add new', FormComponent, orderBy = 'created_at' }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | 'new' | row
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: orderBy === 'created_at' ? false : true })
    if (error) console.error('ContentList error:', error)
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [table])

  async function togglePublished(row) {
    await supabase.from(table).update({ published: !row.published }).eq('id', row.id)
    setRows(rows.map(r => r.id === row.id ? { ...r, published: !r.published } : r))
  }

  async function deleteRow(row) {
    if (!confirm(`Delete "${row[labelField]}"? This cannot be undone.`)) return
    await supabase.from(table).delete().eq('id', row.id)
    setRows(rows.filter(r => r.id !== row.id))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{rows.length} {rows.length === 1 ? 'item' : 'items'}</p>
        <button onClick={() => setEditing('new')}
                className="inline-flex items-center gap-2 bg-[#1565C0] text-white font-semibold
                           text-sm px-4 py-2 rounded-full hover:bg-[#0A2342] transition-colors">
          <Plus size={15}/> {addLabel}
        </button>
      </div>

      {/* Form */}
      {editing && FormComponent && (
        <div className="mb-6 bg-white rounded-2xl border border-[#EAF0FA] p-6 shadow-sm">
          <FormComponent
            row={editing === 'new' ? null : editing}
            table={table}
            onSave={() => { setEditing(null); load() }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* List */}
      {loading
        ? <div className="text-sm text-gray-400">Loading…</div>
        : rows.length === 0
          ? <div className="text-sm text-gray-400 py-8 text-center">No {table} yet — add one above.</div>
          : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id}
                     className="bg-white rounded-xl border border-[#EAF0FA] px-5 py-3
                                flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2342] text-sm truncate">
                      {row[labelField] || row.title || row.name || '(untitled)'}
                    </p>
                    {columns.map(col => (
                      row[col.key] && (
                        <span key={col.key} className="text-xs text-gray-400 mr-3">
                          {col.label}: {String(row[col.key]).slice(0,40)}
                        </span>
                      )
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Published toggle */}
                    <button onClick={() => togglePublished(row)}
                            title={row.published ? 'Published — click to unpublish' : 'Draft — click to publish'}
                            className="transition-colors">
                      {row.published
                        ? <CheckCircle size={17} className="text-green-500"/>
                        : <XCircle    size={17} className="text-gray-300"/>}
                    </button>

                    {/* Edit */}
                    <button onClick={() => setEditing(row)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1565C0] transition-colors">
                      <Pencil size={15}/>
                    </button>

                    {/* Delete */}
                    <button onClick={() => deleteRow(row)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
      }
    </div>
  )
}
// end of file
