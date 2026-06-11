// page.js
// Path: ~/coworker/parks/src/app/admin/events/page.js
// Description: Admin — manage Events. Thin wrapper over <ContentList type="event">.
//              All data flows through @/lib/content; this file names no table.
// ============================================================
'use client'
import ContentList from '@/components/admin/ContentList'
import ContentForm from '@/components/admin/ContentForm'

export default function AdminEvents() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Events</h1>
      <ContentList type="event" labelField="title" addLabel="Add event"
                   orderBy="start_at"
                   columns={[{key:'start_at',label:'Date'},{key:'location',label:'Location'},{key:'category',label:'Category'}]}
                   FormComponent={ContentForm}/>
    </div>
  )
}
// end of file
