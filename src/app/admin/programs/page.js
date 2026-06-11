// page.js
// Path: ~/coworker/parks/src/app/admin/programs/page.js
// Description: Admin — manage Programs. Thin wrapper over <ContentList type="program">.
//              Routes through @/lib/content; names no table.
// ============================================================
'use client'
import ContentList from '@/components/admin/ContentList'
import ContentForm from '@/components/admin/ContentForm'

export default function AdminPrograms() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Programs</h1>
      <ContentList type="program" labelField="title" addLabel="Add program"
                   columns={[{key:'category',label:'Category'},{key:'schedule_text',label:'Schedule'},{key:'age_range',label:'Age'}]}
                   FormComponent={ContentForm}/>
    </div>
  )
}
// end of file
