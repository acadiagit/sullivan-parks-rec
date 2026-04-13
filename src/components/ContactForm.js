// src/components/ContactForm.js
'use client'
import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
const topics = ['General Question','Park Facilities','Events','Programs','Report an Issue','Other']
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [form, setForm]           = useState({ name:'', email:'', topic:'', message:'' })
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    await new Promise(r => setTimeout(r, 800))  // TODO Phase 2: POST to API
    setLoading(false); setSubmitted(true)
  }
  if (submitted) return (
    <div className="bg-blue-50 border border-[#EAF0FA] rounded-2xl p-8 text-center">
      <CheckCircle size={40} className="text-[#27A844] mx-auto mb-3"/>
      <h3 className="font-playfair text-xl text-[#0A2342] mb-2">Message Sent!</h3>
      <p className="text-sm text-gray-500">Thank you, {form.name}. We will get back to you within 1–2 business days.</p>
    </div>
  )
  const inp = 'w-full border border-[#EAF0FA] rounded-lg px-4 py-2.5 text-sm text-[#0A2342] ' +
              'bg-white focus:outline-none focus:ring-2 focus:ring-[#40BCD8] transition placeholder:text-gray-400'
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="name">Your Name *</label>
          <input id="name" name="name" type="text" required className={inp} placeholder="Jane Smith" value={form.name} onChange={handleChange}/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="email">Email Address *</label>
          <input id="email" name="email" type="email" required className={inp} placeholder="jane@example.com" value={form.email} onChange={handleChange}/>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="topic">Topic</label>
        <select id="topic" name="topic" className={inp} value={form.topic} onChange={handleChange}>
          <option value="">Select a topic…</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="message">Message *</label>
        <textarea id="message" name="message" rows={5} required className={inp+' resize-none'} placeholder="How can we help?" value={form.message} onChange={handleChange}/>
      </div>
      <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 bg-[#1565C0] text-white font-semibold
                         text-sm px-6 py-3 rounded-full hover:bg-[#0A2342] transition-colors
                         disabled:opacity-60 shadow-sm">
        {loading ? 'Sending…' : <><Send size={15}/> Send Message</>}
      </button>
    </form>
  )
}
// end of file
