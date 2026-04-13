// src/app/search/page.js
import SearchClient from '@/components/SearchClient'
export const metadata = { title: 'Search' }
export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
      <h1 className="font-playfair text-3xl text-[#0A2342] mb-2">Search</h1>
      <p className="text-gray-500 mb-8">Find parks, events, programs, and news.</p>
      <SearchClient />
    </div>
  )
}
// end of file
