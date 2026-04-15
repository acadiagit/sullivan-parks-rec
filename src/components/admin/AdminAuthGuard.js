// src/components/admin/AdminAuthGuard.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminAuthGuard({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed]     = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true)
        setChecking(false)
      } else if (pathname === '/admin/login') {
        setChecking(false)
      } else {
        router.replace('/admin/login')
        setChecking(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthed(true)
      } else {
        setAuthed(false)
        if (pathname !== '/admin/login') router.replace('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // ← run once only, not on every pathname change

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
        <div className="w-8 h-8 border-4 border-[#1565C0] border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  // Show login page without guard wrapper
  if (pathname === '/admin/login') return <>{children}</>

  if (!authed) return null

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <AdminTopBar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-14 lg:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

function AdminTopBar() {
  const router = useRouter()
  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A2342] flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="font-playfair font-bold text-white text-base">Sullivan Parks</span>
        <span className="text-[#7AD5E8] text-xs font-semibold tracking-widest uppercase">Admin</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="/" target="_blank" rel="noopener noreferrer"
           className="text-xs text-[#7AD5E8] hover:text-white transition-colors">
          ↗ View site
        </a>
        <button onClick={signOut}
                className="text-xs font-semibold text-blue-300 hover:text-white transition-colors">
          Sign out
        </button>
      </div>
    </header>
  )
}

function AdminSidebar() {
  const pathname = usePathname()
  const links = [
    { href: '/admin',          label: 'Dashboard'  },
    { href: '/admin/parks',    label: 'Parks'       },
    { href: '/admin/events',   label: 'Events'      },
    { href: '/admin/programs', label: 'Programs'    },
    { href: '/admin/projects', label: 'Projects'    },
    { href: '/admin/news',     label: 'News'        },
  ]
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-[#EAF0FA]
                      hidden lg:flex flex-col py-4 overflow-y-auto z-40">
      <nav>
        {links.map(({ href, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <a key={href} href={href}
               className={`flex items-center px-5 py-2.5 text-sm font-semibold transition-colors
                           ${active
                             ? 'bg-blue-50 text-[#1565C0] border-l-3 border-[#1565C0]'
                             : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A2342]'}`}>
              {label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
// end of file
