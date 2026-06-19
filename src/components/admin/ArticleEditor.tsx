// src/components/admin/ArticleEditor.tsx
import { useState, useCallback } from 'react'
import { uploadImage } from '../../lib/cloudinary'

interface Category {
  id: string
  name: string
  color: string
}

interface Author {
  id: string
  full_name: string
}

interface ArticleEditorProps {
  article?: {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    image_url: string
    status: 'draft' | 'published'
    category: string
    author_id: string
  }
  categories: Category[]
  authors: Author[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ArticleEditor({ article, categories, authors }: ArticleEditorProps) {
  const isEdit = !!article

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? '')
  const [category, setCategory] = useState(article?.category ?? '')
  const [authorId, setAuthorId] = useState(article?.author_id ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(article?.status ?? 'draft')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, 'articles')
      setImageUrl(url)
    } catch {
      setError('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (!slug.trim()) { setError('El slug es obligatorio'); return }
    setSaving(true)
    setError('')
    try {
      const payload : any = { 
        title, 
        slug, 
        excerpt, 
        content, 
        image_url: imageUrl || null, 
        category: category || null, 
        author_id: authorId || null, 
        status: targetStatus,
      }
      const url = isEdit ? `/api/admin/articles/${article.id}` : '/api/admin/articles'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      window.location.href = `/articles/${data.slug}`
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Simple markdown preview renderer
  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-red-400 underline">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-red-500 pl-4 text-slate-400 my-2">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="col-span-2 space-y-4">
          {/* Title */}
          <div>
            <input
              value={title}
              onChange={handleTitleChange}
              placeholder="Título del artículo"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder-slate-600 focus:border-red-500/50 focus:outline-none transition"
            />
          </div>

          {/* Slug */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">/</span>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="slug-del-articulo"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm font-mono placeholder-slate-600 focus:border-red-500/50 focus:outline-none transition"
            />
          </div>

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Resumen breve (aparece en la lista de artículos)"
            rows={2}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:border-red-500/50 focus:outline-none transition resize-none"
          />

          {/* Markdown editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex border-b border-slate-800">
              {(['write', 'preview'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition ${
                    tab === t ? 'text-white border-b-2 border-red-500' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {t === 'write' ? 'Escribir' : 'Vista previa'}
                </button>
              ))}
              <div className="ml-auto px-4 py-2.5 text-xs text-slate-600">Markdown</div>
            </div>
            {tab === 'write' ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Escribe tu artículo en Markdown..."
                rows={20}
                className="w-full bg-transparent px-4 py-3 text-white text-sm font-mono placeholder-slate-600 focus:outline-none resize-none"
              />
            ) : (
              <div
                className="px-6 py-4 text-slate-300 text-sm min-h-[400px] prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${renderMarkdown(content)}</p>` }}
              />
            )}
          </div>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar borrador'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="w-full py-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Publicando…' : status === 'published' ? 'Actualizar' : 'Publicar'}
            </button>
          </div>

          {/* Cover image */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Portada</p>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Portada" className="w-full h-36 object-cover rounded-lg mb-2" />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-red-500/50 transition ${uploading ? 'opacity-50' : ''}`}>
                <span className="text-slate-500 text-sm">{uploading ? 'Subiendo…' : 'Subir imagen'}</span>
                <span className="text-slate-600 text-xs mt-1">JPG, PNG, WebP</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Categoría</p>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Autor</p>
            <select
              value={authorId}
              onChange={e => setAuthorId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
            >
              <option value="">Sin autor</option>
              {authors.map(a => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}