// page.js
// Path: ~/coworker/parks/src/app/admin/parks/page.js
// Description: Admin — manage Parks. Uses the dedicated ParkList (parks live in
//              their own `parks` table, not unified content).
// ============================================================
'use client'
import ParkList from '@/components/admin/ParkList'
import ParkForm from '@/components/admin/ParkForm'

export default function AdminParks() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Parks</h1>
      <ParkList labelField="name" addLabel="Add park"
                columns={[{key:'address',label:'Address'},{key:'hours',label:'Hours'}]}
                FormComponent={ParkForm}/>
    </div>
  )
}
// end of file
