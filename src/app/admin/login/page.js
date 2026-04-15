// src/app/admin/login/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.replace('/admin')
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input id="email" type="email" required autoFocus
                     className={inp + ' pl-9'}
                     placeholder="you@sullivanmaine.org"
                     value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input id="password" type="password" required
                     className={inp + ' pl-9'}
                     placeholder="••••••••"
                     value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
                  className="w-full bg-[#1565C0] text-white font-bold text-sm py-3 rounded-full
                             hover:bg-[#0A2342] transition-colors disabled:opacity-60 mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/" className="hover:text-[#1565C0] transition-colors">← Back to public site</a>
        </p>
      </div>
    </div>
  )
}
// end of file
