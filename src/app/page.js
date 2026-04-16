// src/app/calendar/page.js
import { supabase } from '@/lib/supabase'
import { TZ } from '@/lib/config'
import { Calendar, Clock, MapPin } from 'lucide-react'

export const metadata = { title: 'Calendar' }
export const revalidate = 60

async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .gte('start_at', new Date(new Date().getFullYear(), 0, 1).toISOString()) // current year forward
    .order('start_at')
  if (error) { console.error(error); return [] }
  return data
}


// Group events by month label e.g. "May 2026"
function groupByMonth(events) {
  const groups = {}
  for (const ev of events) {
    const label = new Date(ev.start_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: TZ })
    if (!groups[label]) groups[label] = []
    groups[label].push(ev)
  }
  return groups
}

const catColor = {
  Volunteer:  'bg-green-100  text-green-800',
  Recreation: 'bg-teal-100   text-teal-800',
  Programs:   'bg-blue-100   text-blue-800',
  Community:  'bg-yellow-100 text-yellow-800',
  General:    'bg-gray-100   text-gray-600',
}

export default async function CalendarPage() {
  const events = await getEvents()
  const groups = groupByMonth(events)

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Calendar size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Event Calendar</h1>
      </div>
      <p className="text-gray-500 mb-8">Upcoming parks and recreation events in Sullivan, Maine.</p>

      {events.length === 0 && (
        <p className="text-gray-400 text-sm">No upcoming events — check back soon.</p>
      )}

      {Object.entries(groups).map(([month, monthEvents]) => (
        <div key={month} className="mb-8">
          <h2 className="font-playfair text-xl text-[#1565C0] border-b-2 border-[#EAF0FA] pb-2 mb-4">
            {month}
          </h2>
          <div className="space-y-3">
            {monthEvents.map((ev) => {
              const d = new Date(ev.start_at)
              const day  = d.toLocaleDateString('en-US', { day: 'numeric', timeZone: TZ })
              const mon  = d.toLocaleDateString('en-US', { month: 'short', timeZone: TZ }).toUpperCase()
              const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
              const endTime = ev.end_at
                ? new Date(ev.end_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
                : null

              return (
                <div key={ev.id}
                     className="bg-white rounded-xl border border-[#EAF0FA] p-4 flex gap-4 card-lift">
                  {/* Day bubble */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1565C0] flex flex-col
                                  items-center justify-center">
                    <span className="text-[9px] font-bold text-[#7AD5E8] leading-none">{mon}</span>
                    <span className="text-xl font-bold text-white leading-none">{day}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider
                                        px-2 py-0.5 rounded-full
                                        ${catColor[ev.category] ?? catColor.General}`}>
                        {ev.category}
                      </span>
                      <span className="font-semibold text-[#0A2342] text-sm">{ev.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={11}/> {time}{endTime ? ` – ${endTime}` : ''}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11}/> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
// end of file
