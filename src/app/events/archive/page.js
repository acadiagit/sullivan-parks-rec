// page.js
// Path: ~/coworker/parks/src/app/events/archive/page.js
// Description: Public read-only archive of past (archived) events.
//              Reads from unified `content` table, status='archived'.
//              Cards are intentionally NOT clickable — archived detail pages return 404.
// ============================================================
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/content'
import { Archive, MapPin, Clock, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Past Events — Sullivan Parks & Rec',
  description: 'Archive of past community events.',
}
export const revalidate = 60

async function getArchivedEvents() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'event')
      .eq('status', 'archived')
      .order('start_at', { ascending: false })
      .limit(200)
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

export default async function ArchivePage() {
  const events = await getArchivedEvents()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
        <ArrowLeft size={14}/> Upcoming events
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Archive size={28} className="text-gray-500" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Past Events</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        A record of community events that have taken place. For currently scheduled events, see{' '}
        <Link href="/events" className="text-[#1565C0] hover:underline">upcoming events</Link>.
      </p>

      {events.length === 0 && (
        <p className="text-gray-400 text-sm">No archived events yet.</p>
      )}

      <div className="space-y-5">
        {events.map((ev) => (
          <article key={ev.id}
                   className="bg-gray-50 rounded-2xl border border-[#EAF0FA] p-6 opacity-90">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catColors[ev.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Tag size={9}/> {ev.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    <Archive size={9}/> Archived
                  </span>
                </div>
                <h2 className="font-playfair text-xl text-[#0A2342]">{ev.title}</h2>
              </div>
              <div className="text-right text-sm font-bold text-gray-500 font-nunito">
                {formatDate(ev.start_at, 'date')}
              </div>
            </div>
            {ev.summary && (
              <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">{ev.summary}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400"/>
                {formatDate(ev.start_at, 'time')}{ev.end_at ? ` – ${formatDate(ev.end_at, 'time')}` : ''}
              </span>
              {ev.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400"/> {ev.location}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
// end of file
