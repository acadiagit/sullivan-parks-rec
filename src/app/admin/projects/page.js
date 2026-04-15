// src/app/admin/projects/page.js
'use client'
import ContentList from '@/components/admin/ContentList'
import ProjectForm from '@/components/admin/ProjectForm'

export default function AdminProjects() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">Projects</h1>
      <ContentList table="projects" labelField="title" addLabel="Add project"
                   columns={[{key:'status',label:'Status'},{key:'year',label:'Year'},{key:'progress_pct',label:'Progress %'}]}
                   FormComponent={ProjectForm}/>
    </div>
  )
}
// end of file
