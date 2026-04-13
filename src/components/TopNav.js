// src/components/TopNav.js
import Link from 'next/link'
import { Phone, Search, Calendar } from 'lucide-react'

export default function TopNav() {
  return (
    <header className="hidden lg:flex items-center justify-end
                       h-11 bg-white border-b border-[#EAF0FA]
                       px-8 gap-6 shadow-sm sticky top-0 z-30">
      {[
        { href: '/contact',  label: 'Contact',  Icon: Phone    },
        { href: '/search',   label: 'Search',   Icon: Search   },
        { href: '/calendar', label: 'Calendar', Icon: Calendar },
      ].map(({ href, label, Icon }) => (
        <Link key={href} href={href}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1565C0]
                         hover:text-[#27A844] transition-colors group">
          <Icon size={14} strokeWidth={2} className="group-hover:scale-110 transition-transform"/>
          {label}
        </Link>
      ))}

      <div className="ml-3 pl-4 border-l border-[#EAF0FA]">
        <a href="https://sullivanmaine.org" target="_blank" rel="noopener noreferrer"
           className="text-xs text-[#40BCD8] hover:text-[#1565C0] transition-colors font-semibold">
          ↗ sullivanmaine.org
        </a>
      </div>
    </header>
  )
}
// end of file
