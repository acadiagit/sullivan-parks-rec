// src/app/events/sullivan-daze/page.js
// Path: ~/coworker/parks/src/app/events/sullivan-daze/page.js
// Description: Sullivan Daze 2026 landing page — displays the print flyer image inline + offers PDF download.
//              This static route overrides the dynamic [slug]/page.js for this one event.
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download } from 'lucide-react'

export const metadata = {
  title: 'Sullivan Daze 2026 — A Coastal Maine Music Festival',
  description:
    'A celebration of community and place. July 31 & August 1, 2026 — Sullivan Waterfront, Maine. Fireworks Saturday at 9 PM.',
  openGraph: {
    title: 'Sullivan Daze 2026',
    description: 'A Coastal Maine Music Festival — July 31 & August 1, 2026.',
    images: ['/Sullivan-Daze-2026-Flyer.png'],
  },
}

export default function SullivanDazePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8 lg:py-10">

      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-[#1565C0] hover:underline mb-6"
      >
        <ArrowLeft size={14}/> All events
      </Link>

      <h1 className="font-playfair text-3xl lg:text-4xl text-[#0A2342] mb-2">
        Sullivan Daze 2026
      </h1>
      <p className="text-gray-600 mb-6 lg:mb-8">
        A Coastal Maine Music Festival · July 31 &amp; August 1, 2026 · Sullivan Waterfront
      </p>

      {/* Flyer image, scaled to viewport */}
      <div className="bg-white rounded-2xl border border-[#EAF0FA] overflow-hidden shadow-sm mb-6">
        <Image
          src="/Sullivan-Daze-2026-Flyer.png"
          alt="Sullivan Daze 2026 flyer — full schedule, food vendors, demonstrations, and crafts"
          width={850}
          height={1100}
          className="w-full h-auto"
          priority
        />
      </div>

      <a
        href="/Sullivan-Daze-2026-Flyer.pdf"
        download
        className="inline-flex items-center gap-2 bg-[#0A2342] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#1565C0] transition-colors shadow-md"
      >
        <Download size={16}/> Download flyer (PDF)
      </a>
    </div>
  )
}
// end of file
