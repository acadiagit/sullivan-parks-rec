// page.js
// Path: ~/coworker/parks/src/app/events/[slug]/page.js
// Description: Public event detail page. Reads from unified `content` table.
//              Uses shared formatDate from content.js for TZ-aware uniform formatting.
//              Category eyebrow hidden from public (re-enable when org grows).
// ============================================================
import { getContent, formatDate, formatDateRange } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const event = await getContent({ type: 'event', slug })
  if (!event) return { title: 'Event — Sullivan Parks & Rec' }
  return {
    title: `${event.title} — Sullivan Parks & Rec`,
    description: event.summary ?? '',
  }
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params
  const event = await getContent({ type: 'event', slug })
  if (!event) notFound()

  return (
    <article className="min-h-screen bg-[#F8FAFF]">
      {/* Cover image — full-bleed banner */}
      {event.cover_url && (
        <div className="w-full h-56 md:h-80 overflow-hidden bg-[#0A2342]">
          <img src={event.cover_url} alt={event.title}
               className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
          <ArrowLeft size={14}/> All events
        </Link>

        <h1 className="font-playfair text-4xl md:text-5xl text-[#0A2342] leading-tight mb-4">
          {event.title}
        </h1>

        {event.start_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Calendar size={15} className="text-[#1565C0]"/>
            <span>{formatDateRange(event.start_at, event.end_at)}</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin size={15} className="text-[#1565C0]"/>
            <span>{event.location}</span>
          </div>
        )}

        {event.summary && (
          <p className="text-base text-gray-700 italic mb-6 leading-relaxed">
            {event.summary}
          </p>
        )}

        {event.body_html && (
          <div className="prose prose-sm md:prose-base max-w-none text-[#0A2342] leading-relaxed"
               dangerouslySetInnerHTML={{__html: event.body_html}}/>
        )}

        {!event.body_html && !event.cover_url && (
          <p className="text-sm text-gray-400 italic mt-6">
            More details to come.
          </p>
        )}
      </div>
    </article>
  )
}
// end of file
