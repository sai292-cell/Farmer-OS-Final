import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

export default async function proxy(request: NextRequest) {
  const intlResponse = createMiddleware(routing)(request)
  const response = intlResponse

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/', '/(en|mr|hi)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
}
