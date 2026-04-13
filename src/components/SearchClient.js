// src/components/SearchClient.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, TreePine, CalendarDays, Users } from 'lucide-react'
const INDEX = [
  { type:'Park',    title:'Sullivan Harbor',           href:'/parks',    desc:'Boat launch, kayak access, Frenchman Bay views' },
  { type:'Park',    title:'Tunk Lake Recreation Area', href:'/parks',    desc:'Swimming, fishing, hiking, picnic area'          },
  { type:'Park',    title:'Sullivan Rec Field',         href:'/parks',    desc:'Soccer, softball, community events'              },
  { type:'Event',   title:'Spring Trail Cleanup',       href:'/events',   desc:'May 10 · Tunk Lake Trail Head'                  },
  { type:'Event',   title:'Kayak & Canoe Launch Day',   href:'/events',   desc:'May 17 · Sullivan Harbor'                       },
  { type:'Event',   title:'Sullivan Daze Festival',     href:'/events',   desc:'Aug 16 · Sullivan Town Common'                  },
  { type:'Program', title:'Summer Soccer League',       href:'/programs', desc:'Youth ages 6-14 · June-August'                 },
  { type:'Program', title:'Morning Yoga at the Harbor', href:'/programs', desc:'Adults · June-August'                          },
  { type:'Program', title:'Bone Builders Exercise',     href:'/programs', desc:'Seniors 60+ · Year-round'                      },
]
const typeIcon  = { Park:TreePine, Event:CalendarDays, Program:Users }
const typeColor = { Park:'bg-blue-100 text-blue-800', Event:'bg-teal-100 text-teal-800', Program:'bg-green-100 text-green-800' }
export default function SearchClient() {
  const [q, setQ] = useState('')
  const results = q.trim().length > 1
    ? INDEX.filter(r => r.title.toLowerCase().includes(q.toLowerCase()) || r.desc.toLowerCase().includes(q.toLowerCase()))
    : []
  return (
    <div>
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40BCD8]"/>
        <input autoFocus type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Search parks, events, programs..."
               className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#EAF0FA] bg-white
                          text-[#0A2342] text-sm focus:outline-none focus:ring-2 focus:ring-[#40BCD8] shadow-sm"/>
      </div>
      {q.trim().length > 1 && (
        <ul className="space-y-3">
          {results.length === 0
            ? <p className="text-sm text-gray-400">No results for that search.</p>
            : results.map((r,i) => {
                const Icon = typeIcon[r.type] ?? Search
                return (
                  <li key={i}>
                    <Link href={r.href} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#EAF0FA] hover:border-[#40BCD8] card-lift">
                      <Icon size={16} className="text-[#1565C0] mt-0.5 shrink-0" strokeWidth={1.8}/>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${typeColor[r.type]}`}>{r.type}</span>
                          <span className="font-semibold text-sm text-[#0A2342]">{r.title}</span>
                        </div>
                        <p className="text-xs text-gray-500">{r.desc}</p>
                      </div>
                    </Link>
                  </li>
                )
              })}
        </ul>
      )}
    </div>
  )
}
// end of file
