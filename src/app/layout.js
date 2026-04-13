// src/app/layout.js
import { Playfair_Display, Nunito } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import Footer from '@/components/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: {
    default: 'Sullivan Parks & Recreation',
    template: '%s | Sullivan Parks & Rec',
  },
  description:
    'Parks, events, programs, and projects for the Town of Sullivan, Maine — Frenchman Bay Region.',
  metadataBase: new URL('https://parks-rec.sullivanmaine.org'),
  openGraph: {
    siteName: 'Sullivan Parks & Recreation',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="bg-cream min-h-screen">
        {/* Desktop sidebar — fixed left */}
        <Sidebar />

        {/* Main column — offset on desktop */}
        <div className="main-offset flex flex-col min-h-screen">
          <TopNav />
          {/* Top padding for fixed nav on mobile; desktop nav is in sidebar area */}
          <main className="flex-1 pt-14 lg:pt-0">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
// end of file
