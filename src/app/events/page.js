// src/app/events/page.js
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'
import { CalendarDays, MapPin, Clock, Tag } from 'lucide-react'

export const metadata = { title: 'Events' }
export const revalidate = 60

async function getEvents() {
  try {
  const { data, error } = await supabase
    .from('events').select('*').eq('published', true).gte('start_at', new Date(new Date().getFullYear(), 0, 1).toISOString()).order('start_at', { ascending: true })
  if (error) { console.error(error); return [] }
  return data ?? []
  } catch(e) { console.error(e); return [] }
}

const catColors = {
  Volunteer:  'bg-green-100 text-green-800',
  Recreation: 'bg-teal-100  text-teal-800',
  Programs:   'bg-blue-100  text-blue-800',
  Community:  'bg-yellow-100 text-yellow-800',
}


function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric', timeZone: TZ })
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', timeZone: TZ })
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
          <article key={ev.id} className="bg-white rounded-2xl border border-[#EAF0FA] p-6 card-lift">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${catColors[ev.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  <Tag size={9}/> {ev.category}
                </span>
                <h2 className="font-playfair text-xl text-[#0A2342]">{ev.title}</h2>
              </div>
              <div className="text-right text-sm font-bold text-[#1565C0] font-nunito">
                {formatDate(ev.start_at)}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">{ev.description}</p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#F5C843]"/> {formatTime(ev.start_at)}{ev.end_at ? ` – ${formatTime(ev.end_at)}` : ''}</span>
              {ev.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#F5C843]"/> {ev.location}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
// end of file
