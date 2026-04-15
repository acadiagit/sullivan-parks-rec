// src/app/admin/programs/page.js
'use client'
import ContentList from '@/components/admin/ContentList'
import ProgramForm from '@/components/admin/ProgramForm'

export default function AdminPrograms() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Programs</h1>
      <ContentList table="programs" labelField="name" addLabel="Add program"
                   columns={[{key:'group_label',label:'Group'},{key:'season',label:'Season'},{key:'status',label:'Status'}]}
                   FormComponent={ProgramForm}/>
    </div>
  )
}
// end of file
