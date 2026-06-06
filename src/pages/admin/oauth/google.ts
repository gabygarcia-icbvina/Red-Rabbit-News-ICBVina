export const prerender = false
import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ redirect, url }) => {
  const requestedRedirect = url.searchParams.get('redirect')
  const returnTo = requestedRedirect?.startsWith('/') ? requestedRedirect : '/admin'

  const callbackUrl = `${url.origin}/admin/callback?redirect=${encodeURIComponent(returnTo)}`
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      skipBrowserRedirect: true, // Supabase no redirige, te da la URL
    },
  })

  if (error || !data.url) return redirect('/admin/login?error=1')

  // Tu servidor redirige a Google — Supabase nunca aparece en pantalla
  return redirect(data.url)
}