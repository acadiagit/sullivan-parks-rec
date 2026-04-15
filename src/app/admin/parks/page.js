// src/app/admin/parks/page.js
'use client'
import ContentList from '@/components/admin/ContentList'
import ParkForm from '@/components/admin/ParkForm'

export default function AdminParks() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Parks</h1>
      <ContentList table="parks" labelField="name" addLabel="Add park"
                   columns={[{key:'address',label:'Address'},{key:'hours',label:'Hours'}]}
                   FormComponent={ParkForm}/>
    </div>
  )
}
// end of file
