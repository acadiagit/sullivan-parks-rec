// ParkList.js
// Path: ~/coworker/parks/src/components/admin/ParkList.js
// Description: Admin CRUD list for the standalone `parks` table (NOT unified
//              content — parks are places other content links to via FK).
//              Restores pre-Phase-2 list behavior for parks only: reads the
//              parks table directly, boolean `published` toggle, hard delete.
//              Pairs with ParkForm. (Migrate parks into `content` later if desired.)
// ============================================================
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'

const TABLE = 'parks'

// Props:
//   columns      [{ key, label }] extra fields shown under the name
//   labelField   primary field for the row title (default 'name')
//   addLabel     label for the add button
//   FormComponent the editor (ParkForm) — receives { row, table, onSave, onCancel }
//   orderBy      sort column (default 'sort_order')
export default function ParkList({
  columns = [],
  labelField = 'name',
  addLabel = 'Add park',
  FormComponent,
  orderBy = 'sort_order',
}) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | 'new' | row

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order(orderBy, { ascending: true })
    if (error) console.error('ParkList load error:', error)
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublished(row) {
    const { error } = await supabase
      .from(TABLE)
      .update({ published: !row.published })
      .eq('id', row.id)
    if (error) { console.error('togglePublished error:', error); return }
    setRows(rows.map(r => r.id === row.id ? { ...r, published: !r.published } : r))
  }

  async function deleteRow(row) {
    if (!confirm(`Delete "${row[labelField]}"? This cannot be undone.`)) return
    const { error } = await supabase.from(TABLE).delete().eq('id', row.id)
    if (error) { console.error('deleteRow error:', error); return }
    setRows(rows.filter(r => r.id !== row.id))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{rows.length} {rows.length === 1 ? 'park' : 'parks'}</p>
        {!editing && (
          <button onClick={() => setEditing('new')}
                  className="inline-flex items-center gap-2 bg-[#1565C0] text-white font-semibold
                             text-sm px-4 py-2 rounded-full hover:bg-[#0A2342] transition-colors">
            <Plus size={15}/> {addLabel}
          </button>
        )}
      </div>

      {/* Form */}
      {editing && FormComponent && (
        <div className="mb-6 bg-white rounded-2xl border border-[#EAF0FA] p-6 shadow-sm">
          <FormComponent
            row={editing === 'new' ? null : editing}
            table={TABLE}
            onSave={() => { setEditing(null); load() }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* List */}
      {loading
        ? <div className="text-sm text-gray-400">Loading…</div>
        : rows.length === 0
          ? <div className="text-sm text-gray-400 py-8 text-center">No parks yet — add one above.</div>
          : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.id}
                     className="bg-white rounded-xl border border-[#EAF0FA] px-5 py-3
                                flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2342] text-sm truncate">
                      {row[labelField] || row.name || '(unnamed)'}
                    </p>
                    {columns.map(col => (
                      row[col.key] && (
                        <span key={col.key} className="text-xs text-gray-400 mr-3">
                          {col.label}: {String(row[col.key]).slice(0, 40)}
                        </span>
                      )
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Published toggle */}
                    <button onClick={() => togglePublished(row)}
                            title={row.published ? 'Published — click to unpublish' : 'Hidden — click to publish'}
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
