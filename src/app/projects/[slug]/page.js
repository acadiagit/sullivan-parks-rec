// page.js
// Path: ~/coworker/parks/src/app/projects/[slug]/page.js
// Description: Public project detail page. Reads from unified `content` table.
//              Mirrors events/[slug]/page.js pattern.
// ============================================================
import { getContent } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const project = await getContent({ type: 'project', slug })
  if (!project) return { title: 'Project — Sullivan Parks & Rec' }
  return {
    title: `${project.title} — Sullivan Parks & Rec`,
    description: project.summary ?? '',
  }
}

const statusStyle = {
  'Completed':   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700'   },
  'In Progress': { dot: 'bg-[#F5C843]',  badge: 'bg-yellow-100 text-yellow-700' },
  'Planned':     { dot: 'bg-gray-400',   badge: 'bg-gray-100  text-gray-600'    },
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params
  const project = await getContent({ type: 'project', slug })
  if (!project) notFound()

  const extras = project.extras || {}
  const s = statusStyle[extras.project_status] ?? statusStyle['Planned']
  const progress = Number(extras.progress_pct) || 0
  const budget = extras.budget_cents ? `$${(Number(extras.budget_cents) / 100).toLocaleString()}` : null

  return (
    <article className="min-h-screen bg-[#F8FAFF]">
      {project.cover_url && (
        <div className="w-full h-56 md:h-80 overflow-hidden bg-[#0A2342]">
          <img src={project.cover_url} alt={project.title}
               className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
          <ArrowLeft size={14}/> All projects
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h1 className="font-playfair text-4xl md:text-5xl text-[#0A2342] leading-tight">
            {project.title}
          </h1>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
            {extras.project_status || 'Planned'}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
          {extras.year && <span>Year: {extras.year}</span>}
          {budget && <span>Budget: {budget}</span>}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <div className="h-2 bg-[#EAF0FA] rounded-full overflow-hidden">
            <div className="h-full bg-[#1565C0] rounded-full" style={{ width: `${progress}%` }}/>
          </div>
        </div>

        {project.summary && (
          <p className="text-base text-gray-700 italic mb-6 leading-relaxed">
            {project.summary}
          </p>
        )}

        {project.body_html && (
          <div className="prose prose-sm md:prose-base max-w-none text-[#0A2342] leading-relaxed"
               dangerouslySetInnerHTML={{__html: project.body_html}}/>
        )}

        {!project.body_html && !project.cover_url && (
          <p className="text-sm text-gray-400 italic mt-6">
            More details to come.
          </p>
        )}
      </div>
    </article>
  )
}
// end of file
