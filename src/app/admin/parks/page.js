// page.js
// Path: ~/coworker/parks/src/app/admin/parks/page.js
// Description: Admin — manage Parks. Now a unified content type (park_info),
//              edited through ContentList + ContentForm like every other type.
//              (Replaces the interim ParkList/ParkForm.)
// ============================================================
'use client'
import ContentList from '@/components/admin/ContentList'
import ContentForm from '@/components/admin/ContentForm'

export default function AdminParks() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Parks</h1>
      <ContentList type="park_info" labelField="title" addLabel="Add park"
                   columns={[{key:'address',label:'Address'},{key:'hours',label:'Hours'}]}
                   FormComponent={ContentForm}/>
    </div>
  )
}
// end of file
