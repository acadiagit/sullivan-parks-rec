// src/app/auth/callback/page.js
// Path: ~/coworker/parks/src/app/auth/callback/page.js
// Description: Magic-link callback — handles BOTH PKCE (?code=) and implicit (#access_token=) flows,
//              and surfaces detailed errors when something fails.
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('')

  useEffect(() => {
    async function handleCallback() {
      const url        = window.location.href
      const queryParams = new URLSearchParams(window.location.search)
      const hashParams  = new URLSearchParams(window.location.hash.slice(1))

      // Log what arrived so we can debug from the browser console
      console.log('[auth/callback] full URL:', url)
      console.log('[auth/callback] query params:', Object.fromEntries(queryParams))
      console.log('[auth/callback] hash params:', Object.fromEntries(hashParams))

      // Check for explicit errors in either location
      const errKey  = queryParams.get('error')  || hashParams.get('error')
      const errCode = queryParams.get('error_code') || hashParams.get('error_code')
      const errDesc = queryParams.get('error_description') || hashParams.get('error_description')

      if (errKey || errCode) {
        const msg = errDesc || errKey || errCode
        setError(decodeURIComponent(msg.replace(/\+/g, ' ')))
        setDebug(`error=${errKey} code=${errCode}`)
        return
      }

      // PKCE flow: ?code=... in the query string
      const code = queryParams.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          console.error('[auth/callback] exchangeCodeForSession failed:', exchangeError)
          setError(exchangeError.message)
          setDebug(`PKCE exchange failed (code length: ${code.length})`)
          return
        }
        router.replace('/admin')
        return
      }

      // Implicit flow: #access_token=... in the URL fragment
      const accessToken  = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      if (accessToken && refreshToken) {
        const { error: setError2 } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (setError2) {
          console.error('[auth/callback] setSession failed:', setError2)
          setError(setError2.message)
          setDebug('Implicit-flow setSession failed')
          return
        }
        router.replace('/admin')
        return
      }

      // No code, no token, no error — something else is going on
      setError('Sign-in link is invalid or missing. Please request a new one.')
      setDebug(`No code or token found. URL had: query=[${[...queryParams.keys()].join(',') || 'empty'}] hash=[${[...hashParams.keys()].join(',') || 'empty'}]`)
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2342] to-[#1565C0]
                    flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        {error ? (
          <>
            <AlertCircle size={40} className="text-red-500 mx-auto mb-4" strokeWidth={1.5}/>
            <h1 className="font-playfair text-lg text-[#0A2342] mb-2">Sign-in failed</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{error}</p>
            {debug && (
              <p className="text-[10px] text-gray-400 font-mono leading-relaxed mb-5 bg-gray-50 p-2 rounded">
                {debug}
              </p>
            )}
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
