// page.js
// Path: ~/coworker/parks/src/app/programs/[slug]/page.js
// Description: Public program detail page. Reads from unified `content` table.
//              Mirrors events/[slug]/page.js pattern.
// ============================================================
import { getContent, formatDate } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, DollarSign, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const program = await getContent({ type: 'program', slug })
  if (!program) return { title: 'Program — Sullivan Parks & Rec' }
  return {
    title: `${program.title} — Sullivan Parks & Rec`,
    description: program.summary ?? '',
  }
}

function formatFee(cents) {
  if (cents === null || cents === undefined || cents === '') return null
  const n = Number(cents)
  if (isNaN(n)) return null
  return n === 0 ? 'Free' : `$${(n / 100).toFixed(2)}`
}

export default async function ProgramDetailPage({ params }) {
  const { slug } = await params
  const program = await getContent({ type: 'program', slug })
  if (!program) notFound()

  const extras = program.extras || {}
  const fee = formatFee(extras.fee_cents)

  return (
    <article className="min-h-screen bg-[#F8FAFF]">
      {program.cover_url && (
        <div className="w-full h-56 md:h-80 overflow-hidden bg-[#0A2342]">
          <img src={program.cover_url} alt={program.title}
               className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        <Link href="/programs" className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-4">
          <ArrowLeft size={14}/> All programs
        </Link>

        <h1 className="font-playfair text-4xl md:text-5xl text-[#0A2342] leading-tight mb-4">
          {program.title}
        </h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
          {extras.age_range && (
            <span>Ages {extras.age_range}</span>
          )}
          {extras.schedule_text && (
            <span className="flex items-center gap-2">
              <Clock size={15} className="text-[#1565C0]"/> {extras.schedule_text}
            </span>
          )}
          {program.location && (
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-[#1565C0]"/> {program.location}
            </span>
          )}
          {fee && (
            <span className="flex items-center gap-2 font-semibold text-[#0A2342]">
              <DollarSign size={15} className="text-[#1565C0]"/> {fee}
            </span>
          )}
        </div>

        {extras.registration_url && (
          <a href={extras.registration_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 bg-[#1565C0] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#0A2342] transition-colors mb-6">
            Register <ExternalLink size={14}/>
          </a>
        )}

        {program.summary && (
          <p className="text-base text-gray-700 italic mb-6 leading-relaxed">
            {program.summary}
          </p>
        )}

        {program.body_html && (
          <div className="prose prose-sm md:prose-base max-w-none text-[#0A2342] leading-relaxed"
               dangerouslySetInnerHTML={{__html: program.body_html}}/>
        )}

        {!program.body_html && !program.cover_url && (
          <p className="text-sm text-gray-400 italic mt-6">
            More details to come.
          </p>
        )}
      </div>
    </article>
  )
}
// end of file
