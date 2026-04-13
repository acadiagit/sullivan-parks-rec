// src/app/parks/page.js
import { TreePine, MapPin, Clock, Waves } from 'lucide-react'

export const metadata = { title: 'Parks' }

// ── Edit parks list here — move to Supabase in Phase 2 ──────
const parks = [
  {
    id: 1,
    name: 'Sullivan Harbor',
    description:
      'Public boat launch, kayak access, and stunning views of Frenchman Bay and the Schoodic Peninsula.',
    amenities: ['Boat Launch', 'Kayak Access', 'Parking', 'Picnic Tables'],
    hours: 'Open year-round, dawn to dusk',
    address: 'Sullivan Harbor Road, Sullivan, ME',
  },
  {
    id: 2,
    name: 'Tunk Lake Recreation Area',
    description:
      'Freshwater swimming, fishing, and hiking. The Tunk Lake Trail offers 4 miles of scenic forest walking.',
    amenities: ['Swimming', 'Fishing', 'Hiking', 'Picnic Area', 'Grills'],
    hours: 'Memorial Day – Labor Day, 8am–6pm',
    address: 'Route 182, Sullivan, ME',
  },
  {
    id: 3,
    name: 'Sullivan Rec Field',
    description:
      'Multi-use athletic field hosting youth soccer, softball, and community events throughout the season.',
    amenities: ['Soccer Field', 'Softball Diamond', 'Restrooms', 'Parking'],
    hours: 'Open year-round',
    address: '12 Recreation Way, Sullivan, ME',
  },
]
// ────────────────────────────────────────────────────────────

export default function ParksPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <TreePine size={28} className="text-green-700" strokeWidth={1.5} />
        <h1 className="font-playfair text-3xl text-green-900">Parks &amp; Facilities</h1>
      </div>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Sullivan's parks and public spaces offer access to Frenchman Bay, freshwater lakes,
        forests, and athletic facilities — all free and open to residents and visitors.
      </p>

      <div className="space-y-6">
        {parks.map((park) => (
          <article
            key={park.id}
            className="bg-white rounded-2xl border border-cream-darker p-6 card-lift"
          >
            <h2 className="font-playfair text-xl text-green-800 mb-1">{park.name}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{park.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {park.amenities.map((a) => (
                <span
                  key={a}
                  className="text-xs bg-green-50 text-green-700 border border-green-200
                             px-2.5 py-0.5 rounded-full font-medium"
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gold-500" /> {park.hours}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gold-500" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(park.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-700 underline underline-offset-2"
                >
                  {park.address}
                </a>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
// end of file
