// src/pages/api/admin/articles/index.ts
import type { APIRoute } from 'astro'
import { supabase } from '../../../../lib/supabase'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken)
    return new Response('No autorizado', { status: 401 })

  const { data: { session } } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  if (!session) return new Response('No autorizado', { status: 401 })

  const body = await request.json()
  const { title, slug, excerpt, content, image_url, category, author_id, status } = body

  if (!title || !slug)
    return new Response('Título y slug son obligatorios', { status: 400 })

  const payload: any = {
    title,
    slug,
    excerpt: excerpt || null,
    content: content || null,
    image_url: image_url || null,
    category: category || null,
    author_id: author_id || null,
    status: status || 'draft',
  }

  const { data, error } = await supabase.from('articles').insert(payload).select().single()

  if (error) return new Response(error.message, { status: 400 })
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}