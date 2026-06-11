// ContentList.js
// Path: ~/coworker/parks/src/components/admin/ContentList.js
// Description: Generic admin CRUD list for the unified `content` table. All reads
//              and status changes route through @/lib/content (single source of
//              truth) — this component never queries Supabase directly. Driven by
//              a `type` prop; pairs with <ContentForm> as the editor.
// ============================================================
'use client'

import { useState, useEffect } from 'react'
import { listContent, archiveContent, restoreContent, formatDate } from '@/lib/content'
import { Plus, Pencil, Eye, EyeOff, Archive } from 'lucide-react'

// Generic CRUD list for any content type (event, program, news, project, park_info).
// Props:
//   type          content discriminator ('event' | 'program' | 'news' | 'project' | 'park_info')
//   columns       [{ key, label }] extra fields shown under the title
//   labelField    primary field for the row title (default 'title')
//   addLabel      label for the add button
//   FormComponent the editor (ContentForm) — receives { row, type, onSave, onCancel }
//   orderBy       sort column (default 'created_at')
export default function ContentList({
  type,
  columns = [],
  labelField = 'title',
  addLabel = 'Add new',
  FormComponent,
  orderBy = 'created_at',
}) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | 'new' | row
  const [busyId, setBusyId]   = useState(null)

  async function load() {
    setLoading(true)
    const data = await listContent({
      type,
      status: null,                                 // admin sees published + archived
      orderBy,
      ascending: orderBy === 'created_at' ? false : true,
    })
    setRows(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [type])

  // Publish ⇄ archive — the only status model in Phase 2 (soft delete).
  async function toggleStatus(row) {
    setBusyId(row.id)
    const fn      = row.status === 'published' ? archiveContent : restoreContent
    const updated = await fn(row.id)
    setBusyId(null)
    if (updated) {
      setRows(rows.map(r =>
        r.id === row.id
          ? { ...r, status: updated.status, archived_at: updated.archived_at }
          : r
      ))
    }
  }

  function renderColValue(row, key) {
    // Top-level column first, then fall back to JSONB `extras` (per-type fields).
    let v = row[key]
    if (v == null || v === '') v = row.extras?.[key]
    if (v == null || v === '') return null
    if (/_at$/.test(key)) return formatDate(v, 'short')   // timestamps → readable
    return String(v).slice(0, 40)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{rows.length} {rows.length === 1 ? 'item' : 'items'}</p>
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
            type={type}
            onSave={() => { setEditing(null); load() }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* List */}
      {loading
        ? <div className="text-sm text-gray-400">Loading…</div>
        : rows.length === 0
          ? <div className="text-sm text-gray-400 py-8 text-center">Nothing here yet — add one above.</div>
          : (
            <div className="space-y-2">
              {rows.map((row) => {
                const archived = row.status === 'archived'
                return (
                  <div key={row.id}
                       className={`bg-white rounded-xl border px-5 py-3 flex items-center justify-between gap-3
                                   ${archived ? 'border-amber-200 opacity-70' : 'border-[#EAF0FA]'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#0A2342] text-sm truncate">
                          {row[labelField] || row.title || '(untitled)'}
                        </p>
                        {archived && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider
                                           bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">
                            <Archive size={9}/> Archived
                          </span>
                        )}
                      </div>
                      {columns.map(col => {
                        const val = renderColValue(row, col.key)
                        return val && (
                          <span key={col.key} className="text-xs text-gray-400 mr-3">
                            {col.label}: {val}
                          </span>
                        )
                      })}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Publish / archive toggle */}
                      <button onClick={() => toggleStatus(row)} disabled={busyId === row.id}
                              title={archived ? 'Archived — click to publish' : 'Published — click to archive'}
                              className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40">
                        {archived
                          ? <EyeOff size={17} className="text-gray-300"/>
                          : <Eye    size={17} className="text-green-500"/>}
                      </button>

                      {/* Edit */}
                      <button onClick={() => setEditing(row)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1565C0] transition-colors">
                        <Pencil size={15}/>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
// end of file
