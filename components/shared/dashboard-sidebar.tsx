'use client'

import { Activity, House, Sprout, Sparkles, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { analytics } from '@/lib/analytics'

const items = [
  { key: 'home', href: '/', icon: House },
  { key: 'farms', href: '/farms', icon: Sprout },
  { key: 'ai', href: '/ai', icon: Sparkles },
  { key: 'activity', href: '/activity', icon: Activity },
  { key: 'profile', href: '/profile', icon: UserRound },
] as const

export function DashboardSidebar() {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface px-4 py-6 lg:block">
      <nav aria-label={t('label')} className="space-y-2">
        {items.map(({ key, href, icon: Icon }) => {
          const active = key === 'home' ? pathname === '/' : pathname.startsWith(`/${key}`)
          return (
            <Link
              key={key}
              href={href}
              onClick={() => analytics.trackEvent('bottom_navigation_used', { destination: key, placement: 'sidebar' })}
              className={`flex min-h-[52px] items-center gap-3 rounded-2xl px-4 text-sm font-semibold ${active ? 'bg-primary-surface text-primary-dark' : 'text-text-secondary hover:bg-background'}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {t(key)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
