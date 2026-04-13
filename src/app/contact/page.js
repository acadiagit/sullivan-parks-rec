// src/app/contact/page.js
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/ContactForm'
export const metadata = { title: 'Contact' }
export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <h1 className="font-playfair text-3xl text-[#0A2342] mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-10 max-w-xl">Questions about parks, events, or programs? We are happy to help.</p>
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-5 text-sm text-gray-700">
          <h2 className="font-playfair text-lg text-[#0A2342]">Get in Touch</h2>
          <div className="flex items-start gap-3"><MapPin size={16} className="text-[#F5C843] mt-0.5 shrink-0"/>
            <a href="https://maps.google.com/?q=1888+US+Highway+1,+Sullivan,+ME+04664" target="_blank" rel="noopener noreferrer" className="hover:text-[#1565C0]">1888 US Highway 1<br/>Sullivan, ME 04664</a>
          </div>
          <div className="flex items-center gap-3"><Phone size={16} className="text-[#F5C843] shrink-0"/>
            <a href="tel:+12074226282" className="hover:text-[#1565C0]">207-422-6282</a>
          </div>
          <div className="flex items-center gap-3"><Mail size={16} className="text-[#F5C843] shrink-0"/>
            <a href="mailto:townclerk@sullivanmaine.org" className="hover:text-[#1565C0]">townclerk@sullivanmaine.org</a>
          </div>
          <div className="flex items-start gap-3"><Clock size={16} className="text-[#F5C843] mt-0.5 shrink-0"/>
            <span>Mon–Thu 7:30 am – 5:00 pm<br/><span className="text-xs text-gray-400">Closed 1:00–1:30 pm</span></span>
          </div>
        </div>
        <div className="lg:col-span-3"><ContactForm /></div>
      </div>
    </div>
  )
}
// end of file
