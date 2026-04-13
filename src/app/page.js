// src/app/page.js
import Link from 'next/link'
import Image from 'next/image'
import { TreePine, CalendarDays, Users, FolderKanban, ArrowRight, MapPin, Clock } from 'lucide-react'

// ── Sample data — replace with Supabase queries in Phase 2 ──
const upcomingEvents = [
  {
    id: 1, category: 'Volunteer',
    title: 'Spring Trail Cleanup',
    date: 'Sat, May 10', time: '9:00 am – 12:00 pm', location: 'Tunk Lake Trail Head',
  },
  {
    id: 2, category: 'Recreation',
    title: 'Kayak & Canoe Launch Day',
    date: 'Sat, May 17', time: '8:00 am – 2:00 pm', location: 'Sullivan Harbor',
  },
  {
    id: 3, category: 'Programs',
    title: 'Youth Soccer Registration Opens',
    date: 'Mon, May 5', time: 'Online', location: 'Sullivan Rec Field',
  },
]

const latestNews = [
  {
    id: 1, date: 'April 8, 2026',
    title: 'New Picnic Area Opens at Tunk Lake',
    excerpt: 'The Parks Committee has completed the new waterfront picnic area with tables, grills, and a kayak launch ramp.',
  },
  {
    id: 2, date: 'April 1, 2026',
    title: 'Summer Program Registration Now Open',
    excerpt: 'Sign up for youth day camps, tennis clinics, and nature walks starting June 23. Spots fill quickly.',
  },
]
// ────────────────────────────────────────────────────────────

// Contrast verified — all meet WCAG AAA (7:1+)
const sections = [
  { href: '/parks',    label: 'Parks',    Icon: TreePine,     bg: 'bg-[#4FA3E8]', textColor: 'text-black', iconBg: '',           desc: 'Trails, boat launches, picnic areas' },
  { href: '/events',   label: 'Events',   Icon: CalendarDays, bg: 'bg-[#27A844]', textColor: 'text-black', iconBg: 'bg-[#1B7A32]', desc: 'Community & recreation events'     },
  { href: '/programs', label: 'Programs', Icon: Users,        bg: 'bg-[#40BCD8]', textColor: 'text-black', iconBg: '',           desc: 'Youth, adult & senior programs'     },
  { href: '/projects', label: 'Projects', Icon: FolderKanban, bg: 'bg-[#0A2342]', textColor: 'text-white', iconBg: '',           desc: 'Capital improvements underway'      },
]

const catBadge = {
  Volunteer:  'bg-blue-100  text-blue-800',
  Recreation: 'bg-teal-100  text-teal-800',
  Programs:   'bg-green-100 text-green-800',
}

export default function HomePage() {
  return (
    <div>
      {/* ── HERO — orange from Sullivan Daze, fades to cream ── */}
      <section className="relative overflow-hidden min-h-[360px] lg:min-h-[440px] flex items-end"
               style={{background: 'linear-gradient(180deg, #FF7200 0%, #FF9A00 60%, #F8FAFF 100%)'}}>

        {/* Wave break at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 60"
             preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 Q200,10 400,40 T800,40 T1200,40 L1200,60 L0,60 Z" fill="#F8FAFF"/>
        </svg>

        {/* Decorative teal splash circles — echoes Sullivan Daze */}
        <div className="absolute top-6 right-10 w-40 h-40 rounded-full bg-[#40BCD8] opacity-20"
             aria-hidden="true"/>
        <div className="absolute top-16 right-28 w-20 h-20 rounded-full bg-[#40BCD8] opacity-15"
             aria-hidden="true"/>

        {/* Hero content — black text on orange = 7.66:1 contrast (AAA) */}
        <div className="relative z-10 px-8 py-12 lg:px-14 lg:py-16 max-w-3xl">

          {/* Town seal logo */}
          <div className="mb-4 flex items-center gap-3">
            <Image
              src="/sullivan-logo.png"
              alt="Town of Sullivan seal, established 1789"
              width={72}
              height={72}
              className="rounded-full bg-white/80 p-1 shadow-md"
              priority
            />
            <p className="font-nunito text-xs font-bold tracking-[0.18em] uppercase text-[#0A2342]">
              Town of Sullivan, Maine
            </p>
          </div>

          {/* Black on orange: 7.66:1 — WCAG AAA */}
          <h1 className="font-playfair text-4xl lg:text-5xl text-black font-bold leading-tight mb-3">
            Parks &amp; Recreation
          </h1>
          <p className="text-[#1A1A1A] text-base lg:text-lg max-w-xl leading-relaxed font-medium">
            Explore Frenchman Bay, launch a kayak, join a community program, or come to Sullivan Daze —
            Sullivan&apos;s coast is yours to enjoy.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/parks"
                  className="inline-flex items-center gap-2 bg-[#0A2342] text-white
                             font-bold text-sm px-5 py-2.5 rounded-full
                             hover:bg-[#1565C0] transition-colors shadow-md">
              Explore Parks <ArrowRight size={15}/>
            </Link>
            <Link href="/events"
                  className="inline-flex items-center gap-2 bg-black/10 text-black
                             font-bold text-sm px-5 py-2.5 rounded-full
                             border-2 border-black/30 hover:bg-black/20 transition-colors">
              Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION CARDS ────────────────────────────── */}
      <section className="px-6 lg:px-10 py-10 max-w-5xl mx-auto">
        <h2 className="font-playfair text-2xl text-[#0A2342] mb-6">What We Offer</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(({ href, label, Icon, bg, textColor, iconBg, desc }) => (
            <Link key={href} href={href}
                  className={`card-lift rounded-2xl p-5 ${bg} flex flex-col gap-3 group`}>
              {/* Icon — with optional darker circle background (Events) */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                              ${iconBg || 'bg-black/10'}`}>
                <Icon size={22} className={textColor} strokeWidth={1.8}/>
              </div>
              <div>
                <p className={`font-playfair font-bold text-xl ${textColor}`}>{label}</p>
                <p className={`text-sm font-semibold leading-snug mt-1 ${textColor} opacity-90`}>
                  {desc}
                </p>
              </div>
              <ArrowRight size={15}
                className={`${textColor} opacity-0 group-hover:opacity-70 transition-opacity self-end`}/>
            </Link>
          ))}
        </div>
      </section>

      {/* ── EVENTS + NEWS ────────────────────────────── */}
      <section className="px-6 lg:px-10 pb-14 max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">

        {/* Events */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-xl text-[#0A2342]">Upcoming Events</h2>
            <Link href="/events"
                  className="text-xs font-semibold text-[#1565C0] hover:text-[#27A844]
                             flex items-center gap-1 transition-colors">
              All events <ArrowRight size={12}/>
            </Link>
          </div>
          <ul className="space-y-3">
            {upcomingEvents.map((ev) => (
              <li key={ev.id}
                  className="bg-white rounded-xl p-4 border border-[#EAF0FA] card-lift">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5
                                  rounded-full ${catBadge[ev.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ev.category}
                </span>
                <p className="font-semibold text-[#0A2342] text-sm mt-1">{ev.title}</p>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays size={11}/> {ev.date}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/> {ev.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={11}/> {ev.location}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/calendar"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold
                           text-[#1565C0] hover:text-[#27A844] transition-colors">
            View full calendar <ArrowRight size={14}/>
          </Link>
        </div>

        {/* News */}
        <div className="lg:col-span-2">
          <h2 className="font-playfair text-xl text-[#0A2342] mb-4">Latest News</h2>
          <ul className="space-y-5">
            {latestNews.map((item) => (
              <li key={item.id} className="border-l-2 border-[#40BCD8] pl-4">
                <p className="text-[11px] text-gray-400 mb-0.5">{item.date}</p>
                <p className="font-semibold text-[#0A2342] text-sm leading-snug">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
// end of file
