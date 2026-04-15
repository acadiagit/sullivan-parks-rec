// src/app/admin/page.js
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TreePine, CalendarDays, Users, FolderKanban, Newspaper, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ parks:0, events:0, programs:0, projects:0, articles:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [parks, events, programs, projects, articles] = await Promise.all([
        supabase.from('parks').select('id', {count:'exact', head:true}),
        supabase.from('events').select('id', {count:'exact', head:true}),
        supabase.from('programs').select('id', {count:'exact', head:true}),
        supabase.from('projects').select('id', {count:'exact', head:true}),
        supabase.from('articles').select('id', {count:'exact', head:true}),
      ])
      setCounts({
        parks:    parks.count    ?? 0,
        events:   events.count   ?? 0,
        programs: programs.count ?? 0,
        projects: projects.count ?? 0,
        articles: articles.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label:'Parks',    count:counts.parks,    href:'/admin/parks',    Icon:TreePine,     color:'bg-[#4FA3E8]' },
    { label:'Events',   count:counts.events,   href:'/admin/events',   Icon:CalendarDays, color:'bg-[#27A844]' },
    { label:'Programs', count:counts.programs, href:'/admin/programs', Icon:Users,        color:'bg-[#40BCD8]' },
    { label:'Projects', count:counts.projects, href:'/admin/projects', Icon:FolderKanban, color:'bg-[#0A2342]' },
    { label:'News',     count:counts.articles, href:'/admin/news',     Icon:Newspaper,    color:'bg-[#FF7200]' },
  ]

  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Sullivan Parks &amp; Recreation content management</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, count, href, Icon, color }) => (
          <Link key={href} href={href}
                className="bg-white rounded-2xl border border-[#EAF0FA] p-5 card-lift group">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" strokeWidth={1.8}/>
            </div>
            <p className="text-3xl font-bold text-[#0A2342]">
              {loading ? '–' : count}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500 font-semibold">{label}</p>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-[#1565C0] transition-colors"/>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h2 className="font-semibold text-[#0A2342] text-sm mb-1">Quick tips</h2>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>All content is <strong>draft by default</strong> — toggle Published when ready</li>
          <li>Changes appear on the public site within 60 seconds</li>
          <li>Upload photos to Supabase Storage bucket <code className="bg-white px-1 rounded">parks-media</code></li>
        </ul>
      </div>
    </div>
  )
}
// end of file
