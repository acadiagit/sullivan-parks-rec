// src/components/admin/ImagePicker.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Image as ImageIcon, Upload, Link, X, Check } from 'lucide-react'

const BUCKET = 'park-media'

// Public folder images (pre-loaded)
const PUBLIC_IMAGES = [
  { name: 'bike-rodeo.png',    url: '/bike-rodeo.png'    },
  { name: 'Clean-up.png',      url: '/Clean-up.png'      },
  { name: 'sullivan-logo.png', url: '/sullivan-logo.png' },
]

export default function ImagePicker({ onInsert, onClose }) {
  const [tab, setTab]           = useState('library')  // library | upload | url
  const [storageImages, setStorageImages] = useState([])
  const [urlInput, setUrlInput] = useState('')
  const [altInput, setAltInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    loadStorage()
  }, [])

  async function loadStorage() {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 100 })
    if (data) {
      setStorageImages(data.filter(f => f.name.match(/\.(png|jpg|jpeg|gif|webp)$/i)))
    }
  }

  function getStorageUrl(name) {
    return `https://zkdfqpyoleacgwntmzgy.supabase.co/storage/v1/object/public/${BUCKET}/${name}`
  }

  function insertImage(url, alt = '') {
    const html = `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:12px 0;">`
    onInsert(html)
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
      setTab('library')
    }
    setUploading(false)
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors
                        ${tab === id
                          ? 'bg-white text-[#1565C0] border-b-2 border-[#1565C0]'
                          : 'text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-[#EAF0FA]">
          <div className="flex gap-1">
            {tabBtn('library', '📁 Library')}
            {tabBtn('upload',  '⬆ Upload')}
            {tabBtn('url',     '🔗 URL')}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18}/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Library tab — public + storage images */}
          {tab === 'library' && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Public folder
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {PUBLIC_IMAGES.map((img) => (
                  <button key={img.url} onClick={() => insertImage(img.url, img.name)}
                          className="group relative aspect-square rounded-xl overflow-hidden
                                     border-2 border-[#EAF0FA] hover:border-[#1565C0] transition-colors">
                    <img src={img.url} alt={img.name}
                         className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-[#1565C0]/0 group-hover:bg-[#1565C0]/20
                                    transition-colors flex items-center justify-center">
                      <Check size={20} className="text-white opacity-0 group-hover:opacity-100"/>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white
                                  text-[10px] px-2 py-1 truncate">{img.name}</p>
                  </button>
                ))}
              </div>

              {storageImages.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Supabase Storage ({BUCKET})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {storageImages.map((img) => (
                      <button key={img.name}
                              onClick={() => insertImage(getStorageUrl(img.name), img.name)}
                              className="group relative aspect-square rounded-xl overflow-hidden
                                         border-2 border-[#EAF0FA] hover:border-[#1565C0] transition-colors">
                        <img src={getStorageUrl(img.name)} alt={img.name}
                             className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-[#1565C0]/0 group-hover:bg-[#1565C0]/20
                                        transition-colors flex items-center justify-center">
                          <Check size={20} className="text-white opacity-0 group-hover:opacity-100"/>
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white
                                      text-[10px] px-2 py-1 truncate">{img.name}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Upload size={32} className="text-[#1565C0]"/>
              </div>
              <p className="text-sm text-gray-500">Upload to Supabase Storage ({BUCKET})</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload}
                     className="hidden"/>
              <button onClick={() => fileRef.current.click()} disabled={uploading}
                      className="bg-[#1565C0] text-white font-semibold text-sm px-6 py-2.5
                                 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-60">
                {uploading ? 'Uploading…' : 'Choose image'}
              </button>
              <p className="text-xs text-gray-400">PNG, JPG, WebP — max 50MB</p>
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Image URL
                </label>
                <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                       placeholder="https://example.com/photo.jpg"
                       className="w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-[#1565C0]"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Alt text (description)
                </label>
                <input type="text" value={altInput} onChange={e => setAltInput(e.target.value)}
                       placeholder="Describe the image"
                       className="w-full border border-[#EAF0FA] rounded-lg px-3 py-2 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-[#1565C0]"/>
              </div>
              {urlInput && (
                <img src={urlInput} alt="preview"
                     className="w-full max-h-48 object-contain rounded-xl border border-[#EAF0FA]"/>
              )}
              <button onClick={() => insertImage(urlInput, altInput)}
                      disabled={!urlInput}
                      className="bg-[#1565C0] text-white font-semibold text-sm px-6 py-2.5
                                 rounded-full hover:bg-[#0A2342] transition-colors disabled:opacity-40">
                Insert image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// end of file
