// src/components/Footer.js
import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

const partners = [
  { name: 'Town of Sullivan',         url: 'https://sullivanmaine.org'              },
  { name: 'Frenchman Bay Conservancy',url: 'https://frenchmanbay.org'               },
  { name: 'Maine State Parks',        url: 'https://www.maine.gov/dacf/parks/'      },
]

export default function Footer() {
  return (
    <footer className="bg-[#0A2342] text-blue-200 mt-auto pb-16 lg:pb-0">
      {/* Wave top border */}
      <svg viewBox="0 0 1200 30" className="w-full block" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,15 Q150,0 300,15 T600,15 T900,15 T1200,15 L1200,30 L0,30 Z"
              fill="#0A2342"/>
        <path d="M0,15 Q150,0 300,15 T600,15 T900,15 T1200,15"
              stroke="#40BCD8" strokeWidth="1.5" fill="none" opacity="0.5"/>
      </svg>

      <div className="max-w-5xl mx-auto px-6 py-9 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h3 className="font-playfair text-white text-lg mb-2">Sullivan Parks &amp; Recreation</h3>
          <p className="text-sm leading-relaxed text-blue-300">
            Serving the Town of Sullivan, Maine — Frenchman Bay Region.
          </p>
        </div>

        {/* Town address */}
        <div>
          <h4 className="section-label mb-3">Town Office</h4>
          <address className="not-italic text-sm space-y-2 text-blue-300">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#F5C843]"/>
              <a href="https://maps.google.com/?q=1888+US+Highway+1,+Sullivan,+ME+04664"
                 target="_blank" rel="noopener noreferrer"
                 className="hover:text-white transition-colors">
                1888 US Highway 1<br/>Sullivan, ME 04664
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-[#F5C843]"/>
              <a href="tel:+12074226282" className="hover:text-white transition-colors">207-422-6282</a>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-[#F5C843]"/>
              <a href="mailto:townclerk@sullivanmaine.org" className="hover:text-white transition-colors">
                townclerk@sullivanmaine.org
              </a>
            </div>
          </address>
          <p className="text-xs text-blue-400 mt-3">Mon–Thu 7:30am–5:00pm</p>
        </div>

        {/* Partners */}
        <div>
          <h4 className="section-label mb-3">Partners</h4>
          <ul className="space-y-2">
            {partners.map(({ name, url }) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-blue-300 hover:text-[#40BCD8] transition-colors">
                  ↗ {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1565C0]/40 px-6 py-3">
        <p className="text-center text-xs text-blue-500">
          © {new Date().getFullYear()} Town of Sullivan, Maine. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
// end of file
