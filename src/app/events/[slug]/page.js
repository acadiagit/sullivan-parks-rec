// src/app/events/[slug]/page.js
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'
import { CalendarDays, MapPin, Clock, Tag, ArrowLeft } from 'lucide-react'

export const revalidate = 60

async function getEvent(slug) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) { console.error(error); return null }
  return data
}

export async function generateMetadata({ params }) {
  const event = await getEvent(params.slug)
  if (!event) return { title: 'Event not found' }
  return {
    title: event.title,
    description: event.description ?? undefined,
  }
}

const catColors = {
  Volunteer:  'bg-green-100 text-green-800',
  Recreation: 'bg-teal-100  text-teal-800',
  Programs:   'bg-blue-100  text-blue-800',
  Community:  'bg-yellow-100 text-yellow-800',
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone: TZ })
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', timeZone: TZ })
}

export default async function EventDetailPage({ params }) {
  const event = await getEvent(params.slug)
  if (!event) notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-6">
        <ArrowLeft size={14}/> All events
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <CalendarDays size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catColors[event.category] ?? 'bg-gray-100 text-gray-600'}`}>
          <Tag size={9}/> {event.category}
        </span>
      </div>

      <h1 className="font-playfair text-4xl text-[#0A2342] mb-4">{event.title}</h1>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-8">
        <span className="flex items-center gap-1.5 font-bold text-[#1565C0] font-nunito">
          <CalendarDays size={14} className="text-[#F5C843]"/> {formatDate(event.start_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#F5C843]"/>
          {formatTime(event.start_at)}{event.end_at ? ` – ${formatTime(event.end_at)}` : ''}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#F5C843]"/> {event.location}
          </span>
        )}
      </div>

      {event.description && (
        <div className="bg-white rounded-2xl border border-[#EAF0FA] p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      )}
    </div>
  )
}
// end of file
