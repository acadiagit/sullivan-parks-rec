// SearchBox.js
// Path: ~/coworker/parks/src/components/SearchBox.js
// Description: Client search input. Submits to /search?q=… via the router.
//              Drop into the site header/nav, or reuse on the results page.
// ============================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBox({
  defaultValue = '',
  placeholder = 'Search the site…',
  autoFocus = false,
}) {
  const router = useRouter()
  const [q, setQ] = useState(defaultValue)

  function submit(e) {
    e.preventDefault()
    const term = q.trim()
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-xs">
      <Search size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
      <input
        type="search"
        name="q"
        value={q}
        autoFocus={autoFocus}
        onChange={e => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search the site"
        className="w-full rounded-full border border-[#EAF0FA] bg-white pl-9 pr-3 py-2
                   text-sm text-[#0A2342] placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition"
      />
    </form>
  )
}

// end of file
