// page.js
// Path: ~/coworker/parks/src/app/admin/news/page.js
// Description: Admin — manage News & Announcements. Wrapper over <ContentList type="news">.
//              Routes through @/lib/content; names no table. (Old table was `articles`.)
// ============================================================
'use client'
import ContentList from '@/components/admin/ContentList'
import ContentForm from '@/components/admin/ContentForm'

export default function AdminNews() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">News &amp; Announcements</h1>
      <ContentList type="news" labelField="title" addLabel="Add article"
                   orderBy="created_at"
                   columns={[{key:'summary',label:'Summary'},{key:'publish_date',label:'Published'}]}
                   FormComponent={ContentForm}/>
    </div>
  )
}
// end of file
