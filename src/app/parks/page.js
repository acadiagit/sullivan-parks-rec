// page.js
// Path: ~/coworker/parks/src/app/parks/page.js
// Description: Public parks & facilities list. Reads from unified `content`
//              (type='park_info'). Each card links to /parks/[slug]. Park fields
//              (address, hours, amenities) live in JSONB `extras`; amenities is
//              a comma-separated string. (Address/map link lives on the detail
//              page — a card-wide <Link> can't contain a nested <a>.)
// ============================================================
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { TreePine, MapPin, Clock, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Parks' }
export const revalidate = 60

async function getParks() {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('type', 'park_info')
    .eq('status', 'published')
    .order('title', { ascending: true })
  if (error) { console.error(error); return [] }
  return data
}

// Amenities are stored as a comma-separated string in extras → array of labels.
function amenityList(park) {
  const raw = park.extras?.amenities
  if (!raw) return []
  return String(raw).split(',').map(s => s.trim()).filter(Boolean)
}

export default async function ParksPage() {
  const parks = await getParks()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <TreePine size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Parks &amp; Facilities</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Sullivan parks offer access to Frenchman Bay, freshwater lakes, forests, and athletic facilities — free and open to all.
      </p>
      {parks.length === 0 && <p className="text-gray-400 text-sm">No parks listed yet.</p>}
      <div className="space-y-6">
        {parks.map((park) => {
          const amenities = amenityList(park)
          const address   = park.extras?.address
          const hours     = park.extras?.hours
          return (
            <Link key={park.id} href={`/parks/${park.slug}`} className="block group">
              <article className="bg-white rounded-2xl border border-[#EAF0FA] p-6 card-lift
                                  transition-all group-hover:border-[#1565C0] group-hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-playfair text-xl text-[#0A2342] mb-1 group-hover:text-[#1565C0] transition-colors">
                    {park.title}
                  </h2>
                  <ChevronRight size={18} className="text-[#1565C0] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"/>
                </div>
                {park.summary && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{park.summary}</p>
                )}
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {amenities.map((a) => (
                      <span key={a} className="text-xs bg-blue-50 text-[#1565C0] border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold">{a}</span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 text-xs text-gray-500">
                  {hours && <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#F5C843]"/> {hours}</span>}
                  {address && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#F5C843]"/> {address}</span>}
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
// end of file
