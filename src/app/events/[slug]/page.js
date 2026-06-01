// src/app/events/[slug]/page.js
// Path: ~/coworker/parks/src/app/events/[slug]/page.js
// Description: Public event detail page. Renders cover image (if any),
//              title, date/time/location, short description, and rich body HTML.
//              Falls back gracefully when newer fields (body, cover_image_url)
//              are NULL on existing rows that pre-date the Phase 1 migration.
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatEastern(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('en-US', {
    timeZone: TZ, dateStyle: 'full', timeStyle: 'short',
  })
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data } = await supabase.from('events').select('title, description').eq('slug', slug).single()
  if (!data) return { title: 'Event — Sullivan Parks & Rec' }
  return {
    title: `${data.title} — Sullivan Parks & Rec`,
    description: data.description ?? '',
  }
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !event) notFound()

  // Public-side filter: skip archived events (don't 404, just don't show)
  if (event.archived_at) notFound()

  return (
    <article className="min-h-screen bg-[#F8FAFF]">
      {/* Cover image — full-bleed banner */}
      {event.cover_image_url && (
        <div className="w-full h-56 md:h-80 overflow-hidden bg-[#0A2342]">
          <img src={event.cover_image_url} alt={event.title}
               className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
          <ArrowLeft size={14}/> All events
        </Link>

        <div className="text-[10px] font-bold uppercase tracking-wider text-[#27A844] mb-2">
          {event.category}
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl text-[#0A2342] leading-tight mb-4">
          {event.title}
        </h1>

        {event.start_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Calendar size={15} className="text-[#1565C0]"/>
            <span>{formatEastern(event.start_at)}{event.end_at && <> → {formatEastern(event.end_at)}</>}</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin size={15} className="text-[#1565C0]"/>
            <span>{event.location}</span>
          </div>
        )}

        {event.description && (
          <p className="text-base text-gray-700 italic mb-6 leading-relaxed">
            {event.description}
          </p>
        )}

        {event.body && (
          <div className="prose prose-sm md:prose-base max-w-none text-[#0A2342] leading-relaxed"
               dangerouslySetInnerHTML={{__html: event.body}}/>
        )}

        {!event.body && !event.cover_image_url && (
          <p className="text-sm text-gray-400 italic mt-6">
            More details to come.
          </p>
        )}
      </div>
    </article>
  )
}
// end of file
