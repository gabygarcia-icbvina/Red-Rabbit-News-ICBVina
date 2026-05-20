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

  // Leer la cookie de sesión
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
    return context.redirect('/admin/login')
  }

  const { data: { session }, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error || !session) {
    return context.redirect('/admin/login')
  }

  // Verificar que sea admin en la tabla profiles
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