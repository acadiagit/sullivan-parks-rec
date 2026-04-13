// src/app/projects/page.js
import { FolderKanban } from 'lucide-react'

export const metadata = { title: 'Projects' }

// ── Edit projects here — move to Supabase in Phase 2 ────────
const projects = [
  {
    id: 1,
    title: 'Tunk Lake Picnic Area Expansion',
    status: 'In Progress',
    year: '2026',
    description:
      'Adding four new picnic shelters, upgraded grills, and an accessible path to the water\'s edge.',
    progress: 65,
  },
  {
    id: 2,
    title: 'Sullivan Harbor Kayak Launch Ramp',
    status: 'Completed',
    year: '2025',
    description:
      'A dedicated kayak and canoe launch ramp at Sullivan Harbor, with parking improvements and signage.',
    progress: 100,
  },
  {
    id: 3,
    title: 'Rec Field Lighting Upgrade',
    status: 'Planned',
    year: '2027',
    description:
      'LED lighting installation at the Sullivan Rec Field to allow evening youth sports programs.',
    progress: 10,
  },
]
// ────────────────────────────────────────────────────────────

const statusStyle = {
  'Completed':   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  'In Progress': { dot: 'bg-gold-500',   badge: 'bg-gold-100  text-gold-700'  },
  'Planned':     { dot: 'bg-gray-400',   badge: 'bg-gray-100  text-gray-600'  },
}

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <FolderKanban size={28} className="text-green-700" strokeWidth={1.5} />
        <h1 className="font-playfair text-3xl text-green-900">Projects</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Capital improvements, park expansions, and community initiatives — past, present, and planned.
      </p>

      <div className="space-y-6">
        {projects.map((proj) => {
          const s = statusStyle[proj.status] ?? statusStyle['Planned']
          return (
            <article
              key={proj.id}
              className="bg-white rounded-2xl border border-cream-darker p-6 card-lift"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <h2 className="font-playfair text-xl text-green-800 flex-1">{proj.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{proj.year}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold
                                 px-2.5 py-0.5 rounded-full ${s.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {proj.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">{proj.description}</p>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all"
                    style={{ width: `${proj.progress}%` }}
                  />
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
