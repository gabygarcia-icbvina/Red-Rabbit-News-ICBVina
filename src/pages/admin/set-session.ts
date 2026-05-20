export const prerender = false

import type { APIRoute } from 'astro'
import { setAuthCookies } from '../../lib/supabase'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const { access_token, refresh_token } = await request.json()

  if (!access_token || !refresh_token) {
    return new Response('Missing tokens', { status: 400 })
  }

  setAuthCookies(cookies, { access_token, refresh_token })
  return new Response('OK', { status: 200 })
}