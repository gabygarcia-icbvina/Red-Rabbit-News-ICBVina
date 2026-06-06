import { defineMiddleware } from 'astro:middleware'
import { createClient } from '@supabase/supabase-js'

export const onRequest = defineMiddleware(async (context, next) => {
  const isAdminRoute = context.url.pathname.startsWith('/admin')
  const isAuthFlowRoute = [
    '/admin/login',
    '/admin/callback',
    '/admin/set-session',
    '/admin/logout',
  ].includes(context.url.pathname)
  const isOAuthRoute = /^\/admin\/oauth(\/.*)?$/.test(context.url.pathname)

  if (!isAdminRoute || isAuthFlowRoute || isOAuthRoute) return next()

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )

  const accessToken = context.cookies.get('sb-access-token')?.value
  const refreshToken = context.cookies.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken) {
    return context.redirect(
      `/admin/login?redirect=${encodeURIComponent(context.url.pathname + context.url.search)}`
    )
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error || !session) {
    // Limpiar cookies inválidas antes de redirigir
    context.cookies.delete('sb-access-token', { path: '/' })
    context.cookies.delete('sb-refresh-token', { path: '/' })
    return context.redirect(
      `/admin/login?redirect=${encodeURIComponent(context.url.pathname + context.url.search)}`
    )
  }

  // Rotar tokens si Supabase emitió nuevos (access token expirado pero refresh válido)
  if (session.access_token !== accessToken) {
    const opts = {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7,
    }
    context.cookies.set('sb-access-token', session.access_token, opts)
    context.cookies.set('sb-refresh-token', session.refresh_token, opts)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return context.redirect('/')
  }

  return next()
})