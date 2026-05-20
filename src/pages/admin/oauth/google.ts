export const prerender = false
import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ redirect, url }) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${url.origin}/admin/callback`,
      skipBrowserRedirect: true, // Supabase no redirige, te da la URL
    },
  })

  if (error || !data.url) return redirect('/admin/login?error=1')

  // Tu servidor redirige a Google — Supabase nunca aparece en pantalla
  return redirect(data.url)
}