// src/app/programs/page.js
import { Users, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Programs' }

// ── Edit programs here — move to Supabase in Phase 2 ────────
const programs = [
  {
    id: 1,
    group: 'Youth',
    color: 'bg-green-700',
    items: [
      { name: 'Summer Soccer League', ages: '6–14', season: 'June–August', status: 'Registration Open' },
      { name: 'Nature Explorers Camp', ages: '7–12', season: 'July', status: 'Coming Soon' },
      { name: 'Junior Kayak Skills', ages: '10–15', season: 'June–July', status: 'Coming Soon' },
    ],
  },
  {
    id: 2,
    group: 'Adult',
    color: 'bg-gold-600',
    items: [
      { name: 'Morning Yoga at the Harbor', ages: 'All adults', season: 'June–August', status: 'Open' },
      { name: 'Adult Kayak Tours', ages: '18+', season: 'May–September', status: 'Open' },
      { name: 'Fitness Walk Group', ages: 'All adults', season: 'Year-round', status: 'Open' },
    ],
  },
  {
    id: 3,
    group: 'Senior',
    color: 'bg-green-600',
    items: [
      { name: 'Bone Builders Exercise', ages: '60+', season: 'Year-round', status: 'Open' },
      { name: 'Senior Birdwatching Walk', ages: '55+', season: 'May–October', status: 'Open' },
    ],
  },
]
// ────────────────────────────────────────────────────────────

const statusColor = {
  'Registration Open': 'bg-green-100 text-green-700',
  'Open':              'bg-green-100 text-green-700',
  'Coming Soon':       'bg-gold-100  text-gold-700',
  'Full':              'bg-red-50    text-red-600',
}

export default function ProgramsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Users size={28} className="text-green-700" strokeWidth={1.5} />
        <h1 className="font-playfair text-3xl text-green-900">Programs</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Recreation and wellness programs for all ages — from youth sports to senior fitness.
      </p>

      <div className="space-y-8">
        {programs.map((group) => (
          <div key={group.id}>
            <div className={`inline-flex items-center gap-2 ${group.color} text-white
                             text-sm font-semibold px-4 py-1.5 rounded-full mb-4`}>
              {group.group} Programs
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-xl border border-cream-darker px-5 py-4
                             flex items-center justify-between gap-4 card-lift"
                >
                  <div>
                    <p className="font-semibold text-green-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ages {item.ages} · {item.season}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5
                                   rounded-full ${statusColor[item.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {item.status}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
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
