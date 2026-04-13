// src/app/calendar/page.js
import { Calendar, Clock, MapPin } from 'lucide-react'
export const metadata = { title: 'Calendar' }
const months = [
  { month:'May 2026', events:[
    { day:5,  title:'Youth Soccer Registration Opens', time:'Online',            location:'sullivanmaine.org', cat:'Programs'   },
    { day:10, title:'Spring Trail Cleanup',            time:'9:00–12:00 am',     location:'Tunk Lake',         cat:'Volunteer'  },
    { day:17, title:'Kayak & Canoe Launch Day',        time:'8:00 am – 2:00 pm', location:'Sullivan Harbor',   cat:'Recreation' },
  ]},
  { month:'August 2026', events:[
    { day:16, title:'Sullivan Daze Festival', time:'10:00 am – 5:00 pm', location:'Town Common', cat:'Community' },
  ]},
]
const catColor = { Programs:'bg-blue-100 text-blue-800', Volunteer:'bg-green-100 text-green-800', Recreation:'bg-teal-100 text-teal-800', Community:'bg-yellow-100 text-yellow-800' }
export default function CalendarPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Calendar size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Event Calendar</h1>
      </div>
      <p className="text-gray-500 mb-8">Upcoming parks and recreation events in Sullivan, Maine.</p>
      {months.map(m => (
        <div key={m.month} className="mb-8">
          <h2 className="font-playfair text-xl text-[#1565C0] border-b-2 border-[#EAF0FA] pb-2 mb-4">{m.month}</h2>
          <div className="space-y-3">
            {m.events.map((ev,i) => (
              <div key={i} className="bg-white rounded-xl border border-[#EAF0FA] p-4 flex gap-4 card-lift">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1565C0] flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-[#7AD5E8] leading-none">{m.month.split(' ')[0].slice(0,3).toUpperCase()}</span>
                  <span className="text-xl font-bold text-white leading-none">{ev.day}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catColor[ev.cat]??'bg-gray-100 text-gray-600'}`}>{ev.cat}</span>
                    <span className="font-semibold text-[#0A2342] text-sm">{ev.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11}/> {ev.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={11}/> {ev.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
// end of file
