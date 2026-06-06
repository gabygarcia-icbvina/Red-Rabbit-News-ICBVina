// src/pages/api/admin/articles/[id].ts
// PUT → actualizar, DELETE → eliminar
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
  const { title, slug, excerpt, content, cover_url, category_id, author_id, status } = body

  const payload: any = {
    title,
    slug,
    excerpt: excerpt || null,
    content: content || null,
    cover_url: cover_url || null,
    category_id: category_id || null,
    author_id: author_id || null,
    status: status ?? 'draft',
  }

  if (status === 'published') {
    payload.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('articles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(error.message, { status: 400 })
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const session = await getSession(cookies)
  if (!session) return new Response('No autorizado', { status: 401 })

  const { id } = params
  const { error } = await supabase.from('articles').delete().eq('id', id)

  if (error) return new Response(error.message, { status: 400 })
  return new Response(null, { status: 204 })
}
