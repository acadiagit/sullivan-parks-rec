// src/components/Sidebar.js
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TreePine, CalendarDays, Users, FolderKanban, Menu, X, Phone, Search, Calendar } from 'lucide-react'

const mainNav = [
  { href: '/parks',    label: 'Parks',    Icon: TreePine      },
  { href: '/events',   label: 'Events',   Icon: CalendarDays  },
  { href: '/programs', label: 'Programs', Icon: Users         },
  { href: '/projects', label: 'Projects', Icon: FolderKanban  },
]

const quickNav = [
  { href: '/contact',  label: 'Contact',  Icon: Phone    },
  { href: '/search',   label: 'Search',   Icon: Search   },
  { href: '/calendar', label: 'Calendar', Icon: Calendar },
]

/* Sullivan wave SVG watermark — top of sidebar */
function WaveAccent() {
  return (
    <svg viewBox="0 0 256 40" className="absolute top-0 left-0 w-full opacity-20" aria-hidden="true">
      <path d="M0,20 Q32,5 64,20 T128,20 T192,20 T256,20 L256,0 L0,0 Z" fill="#40BCD8"/>
    </svg>
  )
}

function NavLink({ href, label, Icon, onClick }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 rounded-r-xl mr-3 text-sm font-semibold
                  transition-all duration-150
                  ${isActive
                    ? 'nav-active text-[#F5C843]'
                    : 'text-blue-100 hover:bg-[#1E7DD4] hover:text-white'}`}
    >
      <Icon size={17} strokeWidth={1.8} />
      {label}
    </Link>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── MOBILE TOP BAR ───────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14
                         bg-[#1565C0] flex items-center justify-between px-4 shadow-lg">
        <button aria-label="Open menu" onClick={() => setOpen(true)}
                className="text-blue-200 hover:text-white p-1">
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          {/* Town seal — inverted white on dark blue */}
          <Image
            src="/sullivan-logo.png"
            alt="Town of Sullivan seal"
            width={34} height={34}
            className="rounded-full bg-white/90 p-0.5"
          />
          <div>
            <span className="font-playfair font-bold text-white text-base leading-tight">Sullivan</span>
            <span className="font-nunito text-[#7AD5E8] text-[10px] tracking-widest uppercase block">
              Parks &amp; Rec
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/search"  aria-label="Search"  className="text-blue-200 hover:text-white"><Search  size={20}/></Link>
          <Link href="/contact" aria-label="Contact" className="text-blue-200 hover:text-white"><Phone   size={19}/></Link>
        </div>
      </header>

      {/* ── BACKDROP ─────────────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 overlay-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col overflow-y-auto
                         transition-transform duration-300
                         bg-gradient-to-b from-[#0A2342] via-[#1565C0] to-[#1E7DD4]
                         ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <WaveAccent />

        {/* Close — mobile */}
        <button aria-label="Close menu" onClick={() => setOpen(false)}
                className="lg:hidden absolute top-4 right-4 text-blue-300 hover:text-white z-10">
          <X size={20}/>
        </button>

        {/* Brand */}
        <div className="relative px-5 pt-8 pb-5 border-b border-[#1E7DD4]/50">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <Image
              src="/sullivan-logo.png"
              alt="Town of Sullivan seal, established 1789"
              width={52} height={52}
              className="rounded-full bg-white/90 p-0.5 shrink-0 shadow-md"
            />
            <div>
              <p className="font-playfair font-bold text-white text-xl leading-tight">Sullivan</p>
              <p className="font-nunito text-[#7AD5E8] text-[10px] tracking-widest uppercase">
                Parks &amp; Recreation
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 pt-5 pb-4" aria-label="Main navigation">
          <p className="section-label px-5 mb-2">Explore</p>
          {mainNav.map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} onClick={() => setOpen(false)} />
          ))}

          <hr className="sun-rule mx-5 my-5" />

          <p className="section-label px-5 mb-2">Quick links</p>
          {quickNav.map(({ href, label, Icon }) => (
            <NavLink key={href} href={href} label={label} Icon={Icon} onClick={() => setOpen(false)} />
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-[#1E7DD4]/40 text-xs text-blue-300">
          <a href="https://sullivanmaine.org" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#F5C843] transition-colors">
            ↗ Town of Sullivan, ME
          </a>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM TAB BAR ────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around
                      h-16 bg-[#0A2342] border-t border-[#1565C0]/60"
           aria-label="Primary navigation">
        {mainNav.map(({ href, label, Icon }) => (
          <MobileTab key={href} href={href} label={label} Icon={Icon} />
        ))}
      </nav>
    </>
  )
}

function MobileTab({ href, label, Icon }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link href={href}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors
                      ${isActive ? 'text-[#F5C843]' : 'text-blue-300 hover:text-white'}`}>
      <Icon size={20} strokeWidth={1.8}/>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </Link>
  )
}
// end of file
