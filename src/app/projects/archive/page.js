// page.js
// Path: ~/coworker/parks/src/app/projects/archive/page.js
// Description: Public read-only archive of past (archived) projects.
//              Reads from unified `content` table, status='archived'.
//              Cards are NOT clickable — archived detail pages return 404.
// ============================================================
import { supabase } from '@/lib/supabase'
import { Archive, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Past Projects — Sullivan Parks & Rec',
  description: 'Archive of past capital improvements and community initiatives.',
}
export const revalidate = 60

async function getArchivedProjects() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'project')
      .eq('status', 'archived')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) { console.error(error); return [] }
    return data ?? []
  } catch (e) { console.error(e); return [] }
}

const statusStyle = {
  'Completed':   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700'   },
  'In Progress': { dot: 'bg-[#F5C843]',  badge: 'bg-yellow-100 text-yellow-700' },
  'Planned':     { dot: 'bg-gray-400',   badge: 'bg-gray-100  text-gray-600'    },
}

export default async function ProjectsArchivePage() {
  const projects = await getArchivedProjects()
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
        <ArrowLeft size={14}/> Current projects
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Archive size={28} className="text-gray-500" strokeWidth={1.5}/>
        <h1 className="font-playfair text-3xl text-[#0A2342]">Past Projects</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        A record of completed or discontinued projects. For current initiatives, see{' '}
        <Link href="/projects" className="text-[#1565C0] hover:underline">projects</Link>.
      </p>

      {projects.length === 0 && (
        <p className="text-gray-400 text-sm">No archived projects yet.</p>
      )}

      <div className="space-y-6">
        {projects.map((proj) => {
          const extras = proj.extras || {}
          const s = statusStyle[extras.project_status] ?? statusStyle['Planned']
          const progress = Number(extras.progress_pct) || 0
          return (
            <article key={proj.id} className="bg-gray-50 rounded-2xl border border-[#EAF0FA] p-6 opacity-90">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 mb-2">
                    <Archive size={9}/> Archived
                  </span>
                  <h2 className="font-playfair text-xl text-[#0A2342]">{proj.title}</h2>
                </div>
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
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${progress}%` }}/>
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
