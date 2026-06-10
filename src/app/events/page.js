// page.js
// Path: ~/coworker/parks/src/app/events/page.js
// Description: Public events list. Reads from unified `content` table.
//              Uses shared formatDate from content.js for TZ-aware uniform formatting.
// ============================================================
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/content'
import { CalendarDays, MapPin, Clock, Tag, ChevronRight, Archive } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Events' }
export const revalidate = 60

async function getEvents() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'event')
      .eq('status', 'published')
      .gte('start_at', new Date(new Date().getFullYear(), 0, 1).toISOString())
      .order('start_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data ?? []
  } catch (e) { console.error(e); return [] }
}

const catColors = {
  Volunteer:  'bg-green-100 text-green-800',
  Recreation: 'bg-teal-100  text-teal-800',
  Programs:   'bg-blue-100  text-blue-800',
  Community:  'bg-yellow-100 text-yellow-800',
}

export default async function EventsPage() {
  const events = await getEvents()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <CalendarDays size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Events</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">Community events and recreation days in Sullivan, Maine.</p>

      {events.length === 0 && <p className="text-gray-400 text-sm">No upcoming events yet.</p>}

      <div className="space-y-5">
        {events.map((ev) => (
          <Link
            key={ev.id}
            href={`/events/${ev.slug}`}
            className="block group"
          >
            <article className="bg-white rounded-2xl border border-[#EAF0FA] p-6 transition-all
                                hover:border-[#1565C0] hover:shadow-md hover:-translate-y-0.5
                                group-focus-visible:ring-2 group-focus-visible:ring-[#1565C0]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${catColors[ev.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Tag size={9}/> {ev.category}
                  </span>
                  <h2 className="font-playfair text-xl text-[#0A2342] group-hover:text-[#1565C0] transition-colors flex items-center gap-1">
                    {ev.title}
                    <ChevronRight size={18} className="text-[#1565C0] opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </h2>
                </div>
                <div className="text-right text-sm font-bold text-[#1565C0] font-nunito">
                  {formatDate(ev.start_at, 'date')}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">{ev.summary}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#F5C843]"/>
                  {formatDate(ev.start_at, 'time')}{ev.end_at ? ` – ${formatDate(ev.end_at, 'time')}` : ''}
                </span>
                {ev.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#F5C843]"/> {ev.location}</span>}
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Footer link to archive */}
      <div className="mt-12 pt-6 border-t border-[#EAF0FA] text-center">
        <Link href="/events/archive"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1565C0] transition-colors">
          <Archive size={14}/> View past events →
        </Link>
      </div>
    </div>
  )
}
// end of file
