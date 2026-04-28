import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public paths that don't need auth
  const publicPaths = ['/auth/login', '/auth/signup', '/auth/callback', '/', '/pricing', '/features', '/blog', '/contact']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (!user && !isPublic) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    // Get user role for redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      url.pathname = `/${profile.role}`
      return NextResponse.redirect(url)
    }
  }

  // Role-based path protection
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/carer') || pathname.startsWith('/family'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      const role = profile.role
      const isAdminPath = pathname.startsWith('/admin')
      const isCarerPath = pathname.startsWith('/carer')
      const isFamilyPath = pathname.startsWith('/family')

      if ((isAdminPath && role !== 'admin') ||
          (isCarerPath && role !== 'carer' && role !== 'admin') ||
          (isFamilyPath && role !== 'family' && role !== 'admin')) {
        url.pathname = `/${role}`
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
