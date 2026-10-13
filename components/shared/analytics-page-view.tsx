'use client'

import { useEffect } from 'react'
import { usePathname } from '@/i18n/routing'
import { analytics } from '@/lib/analytics'

export function AnalyticsPageView() {
  const pathname = usePathname()
  useEffect(() => {
    analytics.trackPageView(pathname)
  }, [pathname])
  return null
}
