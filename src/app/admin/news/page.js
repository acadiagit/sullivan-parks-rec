// src/app/admin/news/page.js
'use client'
import ContentList from '@/components/admin/ContentList'
import ArticleForm from '@/components/admin/ArticleForm'

export default function AdminNews() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-4xl">
      <h1 className="font-playfair text-2xl text-[#0A2342] mb-6">News &amp; Announcements</h1>
      <ContentList table="articles" labelField="title" addLabel="Add article"
                   orderBy="created_at"
                   columns={[{key:'excerpt',label:'Excerpt'},{key:'published_at',label:'Published'}]}
                   FormComponent={ArticleForm}/>
    </div>
  )
}
// end of file
