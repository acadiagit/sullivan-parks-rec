// src/app/projects/page.js
import { supabase } from '@/lib/supabase'
import { FolderKanban } from 'lucide-react'

export const metadata = { title: 'Projects' }
export const revalidate = 60

async function getProjects() {
  const { data, error } = await supabase
    .from('projects').select('*').eq('published', true).order('sort_order')
  if (error) { console.error(error); return [] }
  return data
}

const statusStyle = {
  'Completed':   { dot:'bg-green-500',  badge:'bg-green-100 text-green-700'  },
  'In Progress': { dot:'bg-[#F5C843]',  badge:'bg-yellow-100 text-yellow-700' },
  'Planned':     { dot:'bg-gray-400',   badge:'bg-gray-100  text-gray-600'    },
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <FolderKanban size={28} className="text-[#1565C0]" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Projects</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">Capital improvements, park expansions, and community initiatives.</p>
      {projects.length === 0 && <p className="text-gray-400 text-sm">No projects listed yet.</p>}
      <div className="space-y-6">
        {projects.map((proj) => {
          const s = statusStyle[proj.status] ?? statusStyle['Planned']
          return (
            <article key={proj.id} className="bg-white rounded-2xl border border-[#EAF0FA] p-6 card-lift">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <h2 className="font-playfair text-xl text-[#0A2342] flex-1">{proj.title}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{proj.year}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                    {proj.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{proj.description}</p>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span><span>{proj.progress_pct}%</span>
                </div>
                <div className="h-2 bg-[#EAF0FA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1565C0] rounded-full" style={{width:`${proj.progress_pct}%`}}/>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
// end of file
