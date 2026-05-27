// src/app/page.js
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { TreePine, CalendarDays, Users, FolderKanban, ArrowRight, MapPin, Clock } from 'lucide-react'

export const revalidate = 60

async function getHomeData() {
  const [eventsRes, articlesRes] = await Promise.all([
    supabase.from('events').select('*').eq('published', true).order('start_at').limit(3),
    supabase.from('articles').select('id,title,excerpt,published_at').eq('published', true).order('published_at', {ascending:false}).limit(2),
  ])
  return {
    events:   eventsRes.data   ?? [],
    articles: articlesRes.data ?? [],
  }
}

const sections = [
  { href:'/parks',    label:'Parks',    Icon:TreePine,     bg:'bg-[#4FA3E8]', textColor:'text-black', iconBg:'',              desc:'Trails, boat launches, picnic areas' },
  { href:'/events',   label:'Events',   Icon:CalendarDays, bg:'bg-[#27A844]', textColor:'text-black', iconBg:'bg-[#1B7A32]',  desc:'Community & recreation events'      },
  { href:'/programs', label:'Programs', Icon:Users,        bg:'bg-[#40BCD8]', textColor:'text-black', iconBg:'',              desc:'Youth, adult & senior programs'      },
  { href:'/projects', label:'Projects', Icon:FolderKanban, bg:'bg-[#0A2342]', textColor:'text-white', iconBg:'',              desc:'Capital improvements underway'       },
]

const missionPoints = [
  'The committee will promote accessible recreational opportunities and use of town parks and facilities for citizens of all ages.',
  'The committee will monitor, improve and maintain the recreational assets belonging to the Town of Sullivan.',
  'The committee will collaborate with other organizations and providers to enhance recreational programs offered by the town.',
  'The committee will be responsible for oversight of the Sullivan Daze Planning Committee.',
]

const catBadge = {
  Volunteer:  'bg-green-100 text-green-800',
  Recreation: 'bg-teal-100  text-teal-800',
  Programs:   'bg-blue-100  text-blue-800',
  Community:  'bg-yellow-100 text-yellow-800',
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
}
function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})
}

export default async function HomePage() {
  const { events, articles } = await getHomeData()

  return (
    <div>
      {/* ── HERO (title + full mission) ──────────────── */}
      <section className="relative overflow-hidden"
               style={{background:'linear-gradient(180deg,#FF7200 0%,#FF9A00 60%,#F8FAFF 100%)'}}>
        <div className="absolute top-6 right-10 w-40 h-40 rounded-full bg-[#40BCD8] opacity-20" aria-hidden="true"/>
        <div className="absolute top-16 right-28 w-20 h-20 rounded-full bg-[#40BCD8] opacity-15" aria-hidden="true"/>

        <div className="relative z-10 px-8 py-12 lg:px-14 lg:py-16 max-w-3xl">
          <div className="mb-5 flex items-center gap-4">
            <Image src="/sullivan-logo.png" alt="Town of Sullivan seal, established 1789"
                   width={108} height={108} className="rounded-full bg-white/80 p-1 shadow-md" priority/>
            <p className="font-nunito text-xs font-bold tracking-[0.18em] uppercase text-[#0A2342]">
              Town of Sullivan, Maine
            </p>
          </div>

          <h1 className="font-playfair text-4xl lg:text-5xl text-black font-bold leading-tight mb-5">
            Parks &amp; Recreation
          </h1>

          <p className="text-[#1A1A1A] text-base lg:text-lg leading-relaxed font-medium mb-5">
            It is the mission of the Sullivan Parks and Recreation Committee to
            provide facilities, spaces and programs that will help to enrich the
            lives of all its residents and visitors.
          </p>

          <ul className="space-y-2.5 text-[#1A1A1A] text-sm lg:text-base leading-relaxed pb-4">
            {missionPoints.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[#0A2342] font-bold mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 Q200,10 400,40 T800,40 T1200,40 L1200,60 L0,60 Z" fill="#F8FAFF"/>
        </svg>
      </section>

      {/* ── SECTION CARDS (Parks / Events / Programs / Projects) ── */}
      <section className="px-6 lg:px-10 py-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(({ href, label, Icon, bg, textColor, iconBg, desc }) => (
            <Link key={href} href={href} className={`card-lift rounded-2xl p-5 ${bg} flex flex-col gap-3 group`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg||'bg-black/10'}`}>
                <Icon size={22} className={textColor} strokeWidth={1.8}/>
              </div>
              <div>
                <p className={`font-playfair font-bold text-xl ${textColor}`}>{label}</p>
                <p className={`text-sm font-semibold leading-snug mt-1 ${textColor} opacity-90`}>{desc}</p>
              </div>
              <ArrowRight size={15} className={`${textColor} opacity-0 group-hover:opacity-70 transition-opacity self-end`}/>
            </Link>
          ))}
        </div>
      </section>

      {/* ── EVENTS + NEWS ────────────────────────────── */}
      <section className="px-6 lg:px-10 pb-14 max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-xl text-[#0A2342]">Upcoming Events</h2>
            <Link href="/events" className="text-xs font-semibold text-[#1565C0] hover:text-[#27A844] flex items-center gap-1 transition-colors">
              All events <ArrowRight size={12}/>
            </Link>
          </div>
          {events.length === 0
            ? <p className="text-gray-400 text-sm">No upcoming events — check back soon.</p>
            : (
              <ul className="space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="bg-white rounded-xl p-4 border border-[#EAF0FA] card-lift">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${catBadge[ev.category]??'bg-gray-100 text-gray-600'}`}>{ev.category}</span>
                    <p className="font-semibold text-[#0A2342] text-sm mt-1">{ev.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><CalendarDays size={11}/> {fmtDate(ev.start_at)}</span>
                      <span className="flex items-center gap-1"><Clock size={11}/> {fmtTime(ev.start_at)}</span>
                      {ev.location && <span className="flex items-center gap-1"><MapPin size={11}/> {ev.location}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
          <Link href="/calendar" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#1565C0] hover:text-[#27A844] transition-colors">
            View full calendar <ArrowRight size={14}/>
          </Link>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-playfair text-xl text-[#0A2342] mb-4">Latest News</h2>
          {articles.length === 0
            ? <p className="text-gray-400 text-sm">No news yet.</p>
            : (
              <ul className="space-y-5">
                {articles.map((a) => (
                  <li key={a.id} className="border-l-2 border-[#40BCD8] pl-4">
                    <p className="text-[11px] text-gray-400 mb-0.5">
                      {new Date(a.published_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
                    </p>
                    <p className="font-semibold text-[#0A2342] text-sm leading-snug">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.excerpt}</p>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </section>
    </div>
  )
}
// end of file
