// src/pages/api/admin/articles/[id].ts
import type { APIRoute } from 'astro'
import { supabase } from '../../../../lib/supabase'

export const prerender = false

async function getSession(cookies: any) {
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value
  if (!accessToken || !refreshToken) return null
  const { data: { session } } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return session
}

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSession(cookies)
  if (!session) return new Response('No autorizado', { status: 401 })

  const { id } = params
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

  const { data, error } = await supabase
    .from('articles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(error.message, { status: 400 })
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const session = await getSession(cookies)
  if (!session) return new Response('No autorizado', { status: 401 })

  const { id } = params
  const { error } = await supabase.from('articles').delete().eq('id', id)

  if (error) return new Response(error.message, { status: 400 })
  return new Response(null, { status: 204 })
}