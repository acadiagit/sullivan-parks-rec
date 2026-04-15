// src/app/programs/page.js
import { supabase } from '@/lib/supabase'
import { Users, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Programs' }
export const revalidate = 60

async function getPrograms() {
  const { data, error } = await supabase
    .from('programs').select('*').eq('published', true).order('sort_order')
  if (error) { console.error(error); return [] }
  return data
}

const groupColor = { Youth:'bg-[#1565C0]', Adult:'bg-[#27A844]', Senior:'bg-[#40BCD8]', General:'bg-[#0A2342]' }
const statusBadge = { 'Open':'bg-green-100 text-green-700', 'Coming Soon':'bg-yellow-100 text-yellow-700', 'Full':'bg-red-50 text-red-600', 'Closed':'bg-gray-100 text-gray-500' }

export default async function ProgramsPage() {
  const programs = await getPrograms()
  const groups = [...new Set(programs.map(p => p.group_label))]

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Users size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Programs</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">Recreation and wellness programs for all ages.</p>
      {programs.length === 0 && <p className="text-gray-400 text-sm">No programs listed yet.</p>}
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group}>
            <div className={`inline-flex items-center gap-2 ${groupColor[group] ?? 'bg-gray-700'} text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4`}>
              {group} Programs
            </div>
            <div className="space-y-3">
              {programs.filter(p => p.group_label === group).map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-[#EAF0FA] px-5 py-4 flex items-center justify-between gap-4 card-lift">
                  <div>
                    <p className="font-semibold text-[#0A2342] text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Ages {p.age_range} · {p.season}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${statusBadge[p.status] ?? 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                    <ChevronRight size={16} className="text-gray-400"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
// end of file
