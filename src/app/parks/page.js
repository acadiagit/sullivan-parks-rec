// src/app/parks/page.js
import { supabase } from '@/lib/supabase'
import { TreePine, MapPin, Clock } from 'lucide-react'

export const metadata = { title: 'Parks' }
export const revalidate = 60

async function getParks() {
  const { data, error } = await supabase
    .from('parks').select('*').eq('published', true).order('sort_order')
  if (error) { console.error(error); return [] }
  return data
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
        {parks.map((park) => (
          <article key={park.id} className="bg-white rounded-2xl border border-[#EAF0FA] p-6 card-lift">
            <h2 className="font-playfair text-xl text-[#0A2342] mb-1">{park.name}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{park.description}</p>
            {park.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {park.amenities.map((a) => (
                  <span key={a} className="text-xs bg-blue-50 text-[#1565C0] border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold">{a}</span>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 text-xs text-gray-500">
              {park.hours && <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#F5C843]"/> {park.hours}</span>}
              {park.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#F5C843]"/>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(park.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#1565C0] underline underline-offset-2">{park.address}</a>
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
// end of file
