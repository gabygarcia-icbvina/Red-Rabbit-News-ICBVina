import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

// Llama esto después del signInWithPassword exitoso
export function setAuthCookies(
  cookies: import('astro').AstroCookies,
  session: { access_token: string; refresh_token: string }
) {
  const opts = {
    path: '/',
    httpOnly: true,        // JS del cliente no puede leerla
    secure: true,          // Solo HTTPS
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  }
  cookies.set('sb-access-token',  session.access_token,  opts)
  cookies.set('sb-refresh-token', session.refresh_token, opts)
}