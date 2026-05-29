// src/app/admin/login/page.js
// Path: ~/coworker/parks/src/app/admin/login/page.js
// Description: Admin sign-in page — magic-link only. No passwords.
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState('idle')  // idle | sending | sent | error
  const [error, setError]   = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,  // only existing users can sign in
      },
    })

    if (authError) {
      console.error('Magic link request failed:', authError)
      setStatus('error')
      setError(
        authError.message.toLowerCase().includes('signups not allowed')
          ? "That email isn't authorized for admin access."
          : 'Could not send the sign-in link. Please try again.'
      )
    } else {
      setStatus('sent')
    }
  }

  const inp = 'w-full border border-[#EAF0FA] rounded-lg px-4 py-2.5 text-sm text-[#0A2342] ' +
              'bg-white focus:outline-none focus:ring-2 focus:ring-[#1565C0] transition'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2342] to-[#1565C0]
                    flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/sullivan-logo.png" alt="Town of Sullivan seal"
                 width={64} height={64} className="rounded-full bg-gray-50 p-1 mb-3"/>
          <h1 className="font-playfair text-xl text-[#0A2342] font-bold">Sullivan Parks</h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Admin Portal</p>
        </div>

        {status === 'sent' ? (
          <div className="text-center py-2">
            <CheckCircle2 size={40} className="text-[#27A844] mx-auto mb-4" strokeWidth={1.5}/>
            <h2 className="font-playfair text-lg text-[#0A2342] mb-2">Check your email</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We sent a sign-in link to <strong className="text-[#0A2342]">{email}</strong>.
              The link expires in 1 hour.
            </p>
            <button
              type="button"
              onClick={() => { setStatus('idle'); setEmail('') }}
              className="text-xs text-[#1565C0] hover:underline mt-5"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input id="email" type="email" required autoFocus
                         className={inp + ' pl-9'}
                         placeholder="you@example.com"
                         value={email} onChange={e => setEmail(e.target.value)}/>
                </div>
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-1.5">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>
                  <span>{error}</span>
                </p>
              )}

              <button type="submit" disabled={status === 'sending'}
                      className="w-full bg-[#1565C0] text-white font-bold text-sm py-3 rounded-full
                                 hover:bg-[#0A2342] transition-colors disabled:opacity-60 mt-2">
                {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              We'll email you a one-time link. No password required.
            </p>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/" className="hover:text-[#1565C0] transition-colors">← Back to public site</a>
        </p>
      </div>
    </div>
  )
}
// end of file
