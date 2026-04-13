// src/app/events/page.js
import { CalendarDays, MapPin, Clock, Tag } from 'lucide-react'

export const metadata = { title: 'Events' }

// ── Edit events here — move to Supabase in Phase 2 ──────────
const events = [
  {
    id: 1,
    title: 'Spring Trail Cleanup',
    date: 'Saturday, May 10, 2026',
    time: '9:00 am – 12:00 pm',
    location: 'Tunk Lake Trail Head',
    category: 'Volunteer',
    description:
      'Join neighbors for the annual spring cleanup of Tunk Lake trails. Gloves and bags provided. ' +
      'Light refreshments for all volunteers.',
  },
  {
    id: 2,
    title: 'Kayak & Canoe Launch Day',
    date: 'Saturday, May 17, 2026',
    time: '8:00 am – 2:00 pm',
    location: 'Sullivan Harbor',
    category: 'Recreation',
    description:
      'Free guided kayak tours of Sullivan Harbor and Frenchman Bay. All skill levels welcome. ' +
      'Rental kayaks available for a small fee.',
  },
  {
    id: 3,
    title: 'Youth Soccer Registration',
    date: 'Monday, May 5, 2026',
    time: 'Register online',
    location: 'Sullivan Rec Field',
    category: 'Programs',
    description:
      'Registration opens for the summer youth soccer league (ages 6–14). ' +
      'Games run June through August on weekends.',
  },
  {
    id: 4,
    title: 'Sullivan Daze Celebration',
    date: 'Saturday, August 16, 2026',
    time: '10:00 am – 5:00 pm',
    location: 'Sullivan Town Common',
    category: 'Community',
    description:
      'Annual community celebration featuring music, food vendors, craft fair, ' +
      'kids activities, and kayak races in the harbor.',
  },
]
// ────────────────────────────────────────────────────────────

const catColors = {
  Volunteer:  'bg-green-100 text-green-800',
  Recreation: 'bg-blue-100  text-blue-800',
  Programs:   'bg-gold-100  text-gold-700',
  Community:  'bg-red-50    text-red-700',
}

export default function EventsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <CalendarDays size={28} className="text-green-700" strokeWidth={1.5} />
        <h1 className="font-playfair text-3xl text-green-900">Events</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Community events, recreation days, and seasonal celebrations in Sullivan, Maine.
      </p>

      <div className="space-y-5">
        {events.map((ev) => (
          <article
            key={ev.id}
            className="bg-white rounded-2xl border border-cream-darker p-6 card-lift"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase
                               tracking-wider px-2 py-0.5 rounded-full mb-2
                               ${catColors[ev.category] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  <Tag size={9} /> {ev.category}
                </span>
                <h2 className="font-playfair text-xl text-green-800">{ev.title}</h2>
              </div>
              <div className="text-right text-sm font-semibold text-gold-600 font-nunito">
                {ev.date.split(',')[0]}
                <br />
                <span className="text-xs text-gray-400 font-normal">
                  {ev.date.split(', ').slice(1).join(', ')}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">{ev.description}</p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gold-500" /> {ev.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gold-500" /> {ev.location}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
// end of file
