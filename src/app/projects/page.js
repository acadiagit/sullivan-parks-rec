// page.js
// Path: ~/coworker/parks/src/app/projects/page.js
// Description: Public projects list. Reads from unified `content` table.
//              Sorted newest-updated first.
// ============================================================
import { supabase } from '@/lib/supabase'
import { FolderKanban, Archive } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Projects' }
export const revalidate = 60

async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'project')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data ?? []
  } catch (e) { console.error(e); return [] }
}

const statusStyle = {
  'Completed':   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700'   },
  'In Progress': { dot: 'bg-[#F5C843]',  badge: 'bg-yellow-100 text-yellow-700' },
  'Planned':     { dot: 'bg-gray-400',   badge: 'bg-gray-100  text-gray-600'    },
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
          const extras = proj.extras || {}
          const s = statusStyle[extras.project_status] ?? statusStyle['Planned']
          const progress = Number(extras.progress_pct) || 0
          return (
            <Link key={proj.id} href={`/projects/${proj.slug}`} className="block group">
              <article className="bg-white rounded-2xl border border-[#EAF0FA] p-6 transition-all
                                  hover:border-[#1565C0] hover:shadow-md hover:-translate-y-0.5
                                  group-focus-visible:ring-2 group-focus-visible:ring-[#1565C0]">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <h2 className="font-playfair text-xl text-[#0A2342] flex-1 group-hover:text-[#1565C0] transition-colors">
                    {proj.title}
                  </h2>
                  <div className="flex items-center gap-2 shrink-0">
                    {extras.year && <span className="text-xs text-gray-400">{extras.year}</span>}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                      {extras.project_status || 'Planned'}
                    </span>
                  </div>
                </div>
                {proj.summary && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{proj.summary}</p>
                )}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#EAF0FA] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1565C0] rounded-full" style={{ width: `${progress}%` }}/>
                  </div>
                </div>
              </article>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 pt-6 border-t border-[#EAF0FA] text-center">
        <Link href="/projects/archive"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1565C0] transition-colors">
          <Archive size={14}/> View past projects →
        </Link>
      </div>
    </div>
  )
}
// end of file
