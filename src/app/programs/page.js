// page.js
// Path: ~/coworker/parks/src/app/programs/page.js
// Description: Public programs list. Reads from unified `content` table.
//              Mirrors events/page.js pattern. Sorted newest-updated first.
// ============================================================
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/content'
import { Users, Clock, MapPin, DollarSign, ChevronRight, Archive } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Programs' }
export const revalidate = 60

async function getPrograms() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'program')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data ?? []
  } catch (e) { console.error(e); return [] }
}

function formatFee(cents) {
  if (cents === null || cents === undefined || cents === '') return null
  const n = Number(cents)
  if (isNaN(n)) return null
  return n === 0 ? 'Free' : `$${(n / 100).toFixed(2)}`
}

export default async function ProgramsPage() {
  const programs = await getPrograms()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Users size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Programs</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">Recreation and wellness programs for all ages.</p>

      {programs.length === 0 && <p className="text-gray-400 text-sm">No programs listed yet.</p>}

      <div className="space-y-5">
        {programs.map((p) => {
          const extras = p.extras || {}
          const fee = formatFee(extras.fee_cents)
          return (
            <Link key={p.id} href={`/programs/${p.slug}`} className="block group">
              <article className="bg-white rounded-2xl border border-[#EAF0FA] p-6 transition-all
                                  hover:border-[#1565C0] hover:shadow-md hover:-translate-y-0.5
                                  group-focus-visible:ring-2 group-focus-visible:ring-[#1565C0]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <h2 className="font-playfair text-xl text-[#0A2342] group-hover:text-[#1565C0] transition-colors flex items-center gap-1">
                      {p.title}
                      <ChevronRight size={18} className="text-[#1565C0] opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </h2>
                    {extras.age_range && (
                      <p className="text-xs text-gray-500 mt-0.5">Ages {extras.age_range}</p>
                    )}
                  </div>
                  {fee && (
                    <div className="text-right text-sm font-bold text-[#1565C0] font-nunito">{fee}</div>
                  )}
                </div>
                {p.summary && (
                  <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">{p.summary}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {extras.schedule_text && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#F5C843]"/> {extras.schedule_text}
                    </span>
                  )}
                  {p.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#F5C843]"/> {p.location}
                    </span>
                  )}
                </div>
              </article>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 pt-6 border-t border-[#EAF0FA] text-center">
        <Link href="/programs/archive"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1565C0] transition-colors">
          <Archive size={14}/> View past programs →
        </Link>
      </div>
    </div>
  )
}
// end of file
