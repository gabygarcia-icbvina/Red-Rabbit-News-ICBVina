import { createClient } from '@supabase/supabase-js'
import type { AstroCookies } from 'astro'

// Client general — usado en login con email/password y en el middleware
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

// Client PKCE — solo para el flujo OAuth (callback de Google)
export const supabasePKCE = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: true,
    },
  }
)

export function setAuthCookies(
  cookies: AstroCookies,
  session: { access_token: string; refresh_token: string }
) {
  const opts = {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
  }
  cookies.set('sb-access-token', session.access_token, opts)
  cookies.set('sb-refresh-token', session.refresh_token, opts)
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })
}