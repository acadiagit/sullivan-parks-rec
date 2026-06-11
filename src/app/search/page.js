// page.js
// Path: ~/coworker/parks/src/app/search/page.js
// Description: Public search results. Reads ?q=, calls searchContent() (ranked,
//              published-only, all types), links each hit to its public page.
// ============================================================
import Link from 'next/link'
import { searchContent, formatDate } from '@/lib/content'
import SearchBox from '@/components/SearchBox'
import { SearchX } from 'lucide-react'

export const dynamic = 'force-dynamic'   // results depend on the query string

// Per-type label, public route, and badge color.
const TYPE_META = {
  event:     { label: 'Event',   href: s => `/events/${s}`,   badge: 'bg-green-100 text-green-800'  },
  program:   { label: 'Program', href: s => `/programs/${s}`, badge: 'bg-blue-100 text-blue-800'    },
  news:      { label: 'News',    href: s => `/news/${s}`,     badge: 'bg-yellow-100 text-yellow-800'},
  project:   { label: 'Project', href: s => `/projects/${s}`, badge: 'bg-slate-100 text-slate-700'  },
  park_info: { label: 'Park',    href: s => `/parks/${s}`,    badge: 'bg-teal-100 text-teal-800'    },
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams                 // works in Next 14 & 15
  const q = (params?.q || '').trim()
  const results = q ? await searchContent(q) : []

  return (
    <div className="px-6 lg:px-10 py-10 max-w-3xl mx-auto">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-5">Search</h1>

      <div className="mb-8">
        <SearchBox defaultValue={q} autoFocus placeholder="Search events, programs, news…" />
      </div>

      {/* No query yet */}
      {!q && (
        <p className="text-sm text-gray-500">
          Search across events, programs, news, and projects. Try a place
          (“Tunk Lake”), an activity (“kayak”), or a season (“summer”).
        </p>
      )}

      {/* Query, no hits */}
      {q && results.length === 0 && (
        <div className="text-center py-12">
          <SearchX size={32} className="mx-auto text-gray-300 mb-3"/>
          <p className="text-sm text-gray-500">
            No results for <span className="font-semibold text-[#0A2342]">“{q}”</span>.
          </p>
          <p className="text-xs text-gray-400 mt-1">Check spelling, or try a broader term.</p>
        </div>
      )}

      {/* Hits */}
      {q && results.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {results.length} {results.length === 1 ? 'result' : 'results'} for
            <span className="font-semibold text-[#0A2342]"> “{q}”</span>
          </p>

          <ul className="space-y-3">
            {results.map(row => {
              const meta = TYPE_META[row.type] || {}
              const href = meta.href ? meta.href(row.slug) : '#'
              const showDate = row.type === 'event' || row.type === 'program'
              return (
                <li key={row.id}>
                  <Link href={href}
                        className="block bg-white rounded-xl border border-[#EAF0FA] px-5 py-4
                                   card-lift hover:border-[#1565C0]/40 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.badge || 'bg-gray-100 text-gray-600'}`}>
                        {meta.label || row.type}
                      </span>
                      {showDate && row.start_at && (
                        <span className="text-xs text-gray-400">{formatDate(row.start_at, 'date')}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[#0A2342] text-sm">{row.title}</p>
                    {row.summary && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{row.summary}</p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// end of file
