// page.js
// Path: ~/coworker/parks/src/app/parks/[slug]/page.js
// Description: Public park detail page. Reads a single park_info row from unified
//              `content` via getContent(). Renders cover, summary, body_html
//              (where uploaded docs/images live), and park extras (amenities,
//              hours, address + map link). Modeled on the event detail page.
// ============================================================
import { getContent } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const park = await getContent({ type: 'park_info', slug })
  if (!park) return { title: 'Park — Sullivan Parks & Rec' }
  return {
    title: `${park.title} — Sullivan Parks & Rec`,
    description: park.summary ?? '',
  }
}

// Amenities stored as a comma-separated string in extras → array of labels.
function amenityList(park) {
  const raw = park.extras?.amenities
  if (!raw) return []
  return String(raw).split(',').map(s => s.trim()).filter(Boolean)
}

export default async function ParkDetailPage({ params }) {
  const { slug } = await params
  const park = await getContent({ type: 'park_info', slug })
  if (!park) notFound()

  const amenities = amenityList(park)
  const address   = park.extras?.address
  const hours     = park.extras?.hours

  return (
    <article className="min-h-screen bg-[#F8FAFF]">
      {/* Cover image — full-bleed banner */}
      {park.cover_url && (
        <div className="w-full h-56 md:h-80 overflow-hidden bg-[#0A2342]">
          <img src={park.cover_url} alt={park.title}
               className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        <Link href="/parks" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
          <ArrowLeft size={14}/> All parks
        </Link>

        <h1 className="font-playfair text-4xl md:text-5xl text-[#0A2342] leading-tight mb-4">
          {park.title}
        </h1>

        {/* Hours + address row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-gray-600 mb-4">
          {hours && (
            <span className="flex items-center gap-2">
              <Clock size={15} className="text-[#1565C0]"/> {hours}
            </span>
          )}
          {address && (
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-[#1565C0]"/>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="hover:text-[#1565C0] underline underline-offset-2">{address}</a>
            </span>
          )}
        </div>

        {/* Amenities chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {amenities.map((a) => (
              <span key={a} className="text-xs bg-blue-50 text-[#1565C0] border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold">{a}</span>
            ))}
          </div>
        )}

        {park.summary && (
          <p className="text-base text-gray-700 italic mb-6 leading-relaxed">
            {park.summary}
          </p>
        )}

        {/* Body — where uploaded images/docs/links render */}
        {park.body_html && (
          <div className="prose prose-sm md:prose-base max-w-none text-[#0A2342] leading-relaxed"
               dangerouslySetInnerHTML={{__html: park.body_html}}/>
        )}

        {!park.body_html && !park.cover_url && amenities.length === 0 && (
          <p className="text-sm text-gray-400 italic mt-6">
            More details to come.
          </p>
        )}
      </div>
    </article>
  )
}
// end of file
