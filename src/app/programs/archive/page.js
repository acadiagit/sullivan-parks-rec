// page.js
// Path: ~/coworker/parks/src/app/programs/archive/page.js
// Description: Public read-only archive of past (archived) programs.
//              Reads from unified `content` table, status='archived'.
//              Cards are NOT clickable — archived detail pages return 404.
// ============================================================
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/content'
import { Archive, Clock, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Past Programs — Sullivan Parks & Rec',
  description: 'Archive of past recreation programs.',
}
export const revalidate = 60

async function getArchivedPrograms() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'program')
      .eq('status', 'archived')
      .order('start_at', { ascending: false, nullsFirst: false })
      .limit(200)
    if (error) { console.error(error); return [] }
    return data ?? []
  } catch (e) { console.error(e); return [] }
}

export default async function ProgramsArchivePage() {
  const programs = await getArchivedPrograms()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <Link href="/programs" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
        <ArrowLeft size={14}/> Current programs
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Archive size={28} className="text-gray-500" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Past Programs</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        A record of programs that are no longer running. For current offerings, see{' '}
        <Link href="/programs" className="text-[#1565C0] hover:underline">programs</Link>.
      </p>

      {programs.length === 0 && (
        <p className="text-gray-400 text-sm">No archived programs yet.</p>
      )}

      <div className="space-y-5">
        {programs.map((p) => {
          const extras = p.extras || {}
          return (
            <article key={p.id} className="bg-gray-50 rounded-2xl border border-[#EAF0FA] p-6 opacity-90">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                      <Archive size={9}/> Archived
                    </span>
                  </div>
                  <h2 className="font-playfair text-xl text-[#0A2342]">{p.title}</h2>
                  {extras.age_range && (
                    <p className="text-xs text-gray-500 mt-0.5">Ages {extras.age_range}</p>
                  )}
                </div>
              </div>
              {p.summary && (
                <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">{p.summary}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {extras.schedule_text && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400"/> {extras.schedule_text}
                  </span>
                )}
                {p.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400"/> {p.location}
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
// end of file
