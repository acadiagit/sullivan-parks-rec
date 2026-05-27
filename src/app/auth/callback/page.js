// src/app/auth/callback/page.js
// Path: ~/coworker/parks/src/app/auth/callback/page.js
// Description: Magic-link callback — exchanges the code from the URL for a Supabase session, then redirects to /admin.
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    // Read directly from window.location to avoid Next.js Suspense
    // boundary requirements around useSearchParams in App Router.
    const params  = new URLSearchParams(window.location.search)
    const code    = params.get('code')
    const errKey  = params.get('error')
    const errDesc = params.get('error_description')

    if (errKey) {
      setError(errDesc || errKey)
      return
    }
    if (!code) {
      setError('Sign-in link is invalid or missing. Please request a new one.')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: e }) => {
      if (e) {
        console.error('Code exchange failed:', e)
        setError('Sign-in link has expired or was already used. Please request a new one.')
      } else {
        router.replace('/admin')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2342] to-[#1565C0]
                    flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
        {error ? (
          <>
            <AlertCircle size={40} className="text-red-500 mx-auto mb-4" strokeWidth={1.5}/>
            <h1 className="font-playfair text-lg text-[#0A2342] mb-2">Sign-in failed</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{error}</p>
            <a href="/admin/login"
               className="inline-block bg-[#1565C0] text-white text-sm font-bold py-2 px-5 rounded-full hover:bg-[#0A2342] transition-colors">
              Back to sign-in
            </a>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-[#EAF0FA] border-t-[#1565C0] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  )
}
// end of file
