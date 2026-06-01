// src/components/admin/MediaPicker.js
// Path: ~/coworker/parks/src/components/admin/MediaPicker.js
// Description: Universal media picker modal — supersedes ImagePicker.
//              Four type tabs (Image / Document / Video / Link), each with
//              Library / Upload / URL sub-tabs as applicable.
//              Two callback modes:
//                onInsert(html)  — default, returns HTML for body injection
//                onSelectUrl(url) — when set, returns raw URL only (for cover fields)
//              Optional `accept` prop restricts which type tabs appear.
'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { BUCKET, SUPABASE_URL } from '@/lib/config'
import {
  Image as ImageIcon, FileText, Video as VideoIcon, Link as LinkIcon,
  Upload, X, Check,
} from 'lucide-react'

// ── Public folder pre-loaded assets ──────────────────────────────────────
const PUBLIC_ASSETS = {
  image: [
    { name: 'bike-rodeo.png',    url: '/bike-rodeo.png' },
    { name: 'Clean-up.png',      url: '/Clean-up.png' },
    { name: 'sullivan-logo.png', url: '/sullivan-logo.png' },
  ],
  document: [
    { name: 'Sullivan-Daze-2026-Flyer.pdf', url: '/Sullivan-Daze-2026-Flyer.pdf' },
    { name: 'Bikerodeo-EllsAmerican.pdf',   url: '/Bikerodeo-EllsAmerican.pdf' },
  ],
  video: [],
}

// ── Type definitions ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  image: {
    label: 'Image',
    Icon: ImageIcon,
    extensions: /\.(png|jpe?g|gif|webp|svg)$/i,
    accept: 'image/*',
    hint: 'PNG, JPG, GIF, WebP, SVG — max 50 MB',
  },
  document: {
    label: 'Document',
    Icon: FileText,
    extensions: /\.(pdf|docx?|txt)$/i,
    accept: '.pdf,.doc,.docx,.txt,application/pdf',
    hint: 'PDF, DOC, DOCX, TXT — max 50 MB',
  },
  video: {
    label: 'Video',
    Icon: VideoIcon,
    extensions: /\.(mp4|webm|mov)$/i,
    accept: 'video/mp4,video/webm,video/quicktime',
    hint: 'MP4, WebM, MOV — or paste a YouTube/Vimeo URL on the URL tab',
  },
  link: {
    label: 'Link',
    Icon: LinkIcon,
    extensions: null,
    accept: null,
    hint: null,
  },
}

// ── HTML generators per type ─────────────────────────────────────────────
function htmlForImage(url, alt='')   { return `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:12px 0;">` }
function htmlForDocument(url, name)  {
  const fname = name || url.split('/').pop()
  return `<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;padding:8px 12px;background:#F8FAFF;border:1px solid #EAF0FA;border-radius:8px;color:#1565C0;font-weight:600;text-decoration:none;margin:8px 0;">📄 ${fname}</a>`
}
function htmlForVideo(url)           {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return `<div style="position:relative;padding-top:56.25%;margin:12px 0;border-radius:8px;overflow:hidden;"><iframe src="https://www.youtube.com/embed/${yt[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `<div style="position:relative;padding-top:56.25%;margin:12px 0;border-radius:8px;overflow:hidden;"><iframe src="https://player.vimeo.com/video/${vm[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`
  // Direct mp4/webm
  return `<video src="${url}" controls style="max-width:100%;border-radius:8px;margin:12px 0;"></video>`
}
function htmlForLink(url, text)      { return `<a href="${url}" target="_blank" rel="noopener" style="color:#1565C0;font-weight:600;">${text || url}</a>` }

// ── Component ────────────────────────────────────────────────────────────
export default function MediaPicker({
  onInsert,
  onSelectUrl,
  accept,          // array like ['image'] — restricts which type tabs render
  onClose,
}) {
  // Restrict type tabs if `accept` prop given
  const allTypes = ['image', 'document', 'video', 'link']
  const availableTypes = accept ? allTypes.filter(t => accept.includes(t)) : allTypes

  const [type, setType] = useState(availableTypes[0] || 'image')
  const [subtab, setSubtab] = useState('library')   // library | upload | url
  const [storageItems, setStorageItems] = useState([])
  const [urlInput, setUrlInput] = useState('')
  const [altInput, setAltInput] = useState('')
  const [linkText, setLinkText] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  // When type changes, reset to library tab (except link which only has URL)
  useEffect(() => {
    if (type === 'link') setSubtab('url')
    else setSubtab('library')
    setUrlInput(''); setAltInput(''); setLinkText('')
  }, [type])

  // Reload storage items when type changes
  useEffect(() => {
    if (type === 'link') return
    loadStorage()
  }, [type])

  async function loadStorage() {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
    if (data) {
      const re = TYPE_CONFIG[type].extensions
      setStorageItems(re ? data.filter(f => re.test(f.name)) : [])
    }
  }

  const getStorageUrl = (name) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`

  // ── Insertion logic ───────────────────────────────────────────────────
  function selectItem({ url, name = '' }) {
    if (onSelectUrl) {
      onSelectUrl(url)
    } else if (onInsert) {
      let html
      if (type === 'image')         html = htmlForImage(url, altInput || name)
      else if (type === 'document') html = htmlForDocument(url, name)
      else if (type === 'video')    html = htmlForVideo(url)
      else if (type === 'link')     html = htmlForLink(url, linkText || url)
      onInsert(html)
    }
    onClose()
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (!error) {
      await loadStorage()
      setSubtab('library')
    }
    setUploading(false)
  }

  // ── Renderers ─────────────────────────────────────────────────────────
  const typeBtn = (t) => {
    const cfg = TYPE_CONFIG[t]; const Icon = cfg.Icon; const active = type === t
    return (
      <button key={t} type="button" onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors
                          ${active ? 'bg-[#1565C0] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
        <Icon size={14}/> {cfg.label}
      </button>
    )
  }

  const subtabBtn = (id, label) => (
    <button type="button" onClick={() => setSubtab(id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors
                        ${subtab === id ? 'bg-white text-[#1565C0] shadow-sm border border-[#EAF0FA]' : 'text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  )

  function renderLibrary() {
    const publicList = PUBLIC_ASSETS[type] || []
    const isImg = type === 'image'
    const renderItem = (item, isPublic = false) => (
      <button key={item.name} type="button" onClick={() => selectItem({ url: isPublic ? item.url : getStorageUrl(item.name), name: item.name })}
              className="group relative aspect-square rounded-xl overflow-hidden border-2 border-[#EAF0FA] hover:border-[#1565C0] transition-colors bg-gray-50 flex items-center justify-center">
        {isImg ? (
          <img src={isPublic ? item.url : getStorageUrl(item.name)} alt={item.name} className="w-full h-full object-cover"/>
        ) : (
          <div className="flex flex-col items-center gap-1 p-2 text-center">
            {type === 'document' ? <FileText size={28} className="text-[#1565C0]"/> : <VideoIcon size={28} className="text-[#1565C0]"/>}
            <span className="text-[10px] font-medium text-gray-600 break-all line-clamp-2">{item.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-[#1565C0]/0 group-hover:bg-[#1565C0]/20 transition-colors flex items-center justify-center">
          <Check size={20} className="text-white opacity-0 group-hover:opacity-100"/>
        </div>
        {isImg && (
          <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">{item.name}</p>
        )}
      </button>
    )
    return (
      <div>
        {publicList.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Public folder</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {publicList.map(item => renderItem(item, true))}
            </div>
          </>
        )}
        {storageItems.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Supabase Storage ({BUCKET})</p>
            <div className="grid grid-cols-3 gap-3">
              {storageItems.map(item => renderItem(item, false))}
            </div>
          </>
        )}
        {publicList.length === 0 && storageItems.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">No {TYPE_CONFIG[type].label.toLowerCase()}s in storage yet. Use the Upload tab to add one.</p>
        )}
      </div>
    )
  }

  function renderUpload() {
    const cfg = TYPE_CONFIG[type]; const Icon = cfg.Icon
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Upload size={32} className="text-[#1565C0]"/>
        </div>
        <p className="text-sm text-gray-500">Upload to Supabase Storage ({BUCKET})</p>
        <input ref={fileRef} type="file" accept={cfg.accept} onChange={handleUpload} className="hidden"/>
        <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
                className="bg-[#1565C0] text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-60">
          {uploading ? 'Uploading…' : `Choose ${cfg.label.toLowerCase()}`}
        </button>
        <p className="text-xs text-gray-400">{cfg.hint}</p>
      </div>
    )
  }

  function renderUrl() {
    return (
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {type === 'video' ? 'Video URL (YouTube, Vimeo, or direct .mp4)' :
             type === 'document' ? 'Document URL' :
             type === 'link' ? 'Link URL' : 'Image URL'}
          </label>
          <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                 placeholder="https://example.com/..."
                 className="w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"/>
        </div>
        {type === 'image' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alt text (description)</label>
            <input type="text" value={altInput} onChange={e => setAltInput(e.target.value)}
                   placeholder="Describe the image"
                   className="w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"/>
          </div>
        )}
        {type === 'link' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link text</label>
            <input type="text" value={linkText} onChange={e => setLinkText(e.target.value)}
                   placeholder="Click here (optional — defaults to URL)"
                   className="w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"/>
          </div>
        )}
        {urlInput && type === 'image' && (
          <img src={urlInput} alt="preview" className="w-full max-h-48 object-contain rounded-xl border border-[#EAF0FA]"/>
        )}
        <button type="button" onClick={() => selectItem({ url: urlInput, name: urlInput.split('/').pop() })}
                disabled={!urlInput}
                className="bg-[#1565C0] text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-40">
          Insert {TYPE_CONFIG[type].label.toLowerCase()}
        </button>
      </div>
    )
  }

  // ── Layout ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header — type tabs */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#EAF0FA]">
          <div className="flex gap-1.5">
            {availableTypes.map(typeBtn)}
          </div>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18}/>
          </button>
        </div>

        {/* Sub-tabs (Library / Upload / URL) — only for non-link types */}
        {type !== 'link' && (
          <div className="flex gap-1 px-5 pt-3 pb-2 bg-gray-50 border-b border-[#EAF0FA]">
            {subtabBtn('library', 'Library')}
            {subtabBtn('upload',  'Upload')}
            {subtabBtn('url',     'URL')}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {type === 'link' && renderUrl()}
          {type !== 'link' && subtab === 'library' && renderLibrary()}
          {type !== 'link' && subtab === 'upload'  && renderUpload()}
          {type !== 'link' && subtab === 'url'     && renderUrl()}
        </div>
      </div>
    </div>
  )
}
// end of file
