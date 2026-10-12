import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames, skipping internal Next.js paths and static files
  matcher: ['/', '/(en|mr|hi)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}
