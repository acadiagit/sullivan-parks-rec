// src/app/admin/events/page.js
'use client'
import ContentList from '@/components/admin/ContentList'
import EventForm from '@/components/admin/EventForm'

export default function AdminEvents() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Events</h1>
      <ContentList table="events" labelField="title" addLabel="Add event"
                   orderBy="start_at"
                   columns={[{key:'start_at',label:'Date'},{key:'location',label:'Location'},{key:'category',label:'Category'}]}
                   FormComponent={EventForm}/>
    </div>
  )
}
// end of file
