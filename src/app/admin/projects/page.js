// page.js
// Path: ~/coworker/parks/src/app/admin/projects/page.js
// Description: Admin — manage Projects. Thin wrapper over <ContentList type="project">.
//              Routes through @/lib/content; names no table.
// ============================================================
'use client'
import ContentList from '@/components/admin/ContentList'
import ContentForm from '@/components/admin/ContentForm'

export default function AdminProjects() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Projects</h1>
      <ContentList type="project" labelField="title" addLabel="Add project"
                   columns={[{key:'project_status',label:'Status'},{key:'year',label:'Year'},{key:'progress_pct',label:'Progress %'}]}
                   FormComponent={ContentForm}/>
    </div>
  )
}
// end of file
