'use client'

import { Activity, House, Sprout, Sparkles, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { analytics } from '@/lib/analytics'

const items = [
  { key: 'home', href: '/', icon: House },
  { key: 'farms', href: '/farms', icon: Sprout },
  { key: 'activity', href: '/activity', icon: Activity },
  { key: 'profile', href: '/profile', icon: UserRound },
] as const

export function BottomNav() {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const router = useRouter()

  const goTo = (key: string, href: string) => {
    analytics.trackEvent('bottom_navigation_used', { destination: key })
    router.push(href)
  }

  return (
    <nav aria-label={t('label')} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_-2px_rgba(27,94,32,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
        <NavItem item={items[0]} active={pathname === '/'} label={t('home')} onClick={goTo} />
        <NavItem item={items[1]} active={pathname.startsWith('/farms')} label={t('farms')} onClick={goTo} />
        <button
          type="button"
          onClick={() => {
            analytics.trackEvent('ai_button_used', { placement: 'bottom_navigation' })
            router.push('/ai')
          }}
          className="-mt-8 flex min-h-[80px] flex-col items-center justify-end gap-1 text-xs font-semibold text-primary-dark"
          aria-label={t('ai')}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-gradient-to-tr from-primary-dark to-primary text-white shadow-lg shadow-primary/30">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </span>
          <span>{t('ai')}</span>
        </button>
        <NavItem item={items[2]} active={pathname.startsWith('/activity')} label={t('activity')} onClick={goTo} />
        <NavItem item={items[3]} active={pathname.startsWith('/profile')} label={t('profile')} onClick={goTo} />
      </div>
    </nav>
  )
}

function NavItem({
  item,
  active,
  label,
  onClick,
}: {
  item: (typeof items)[number]
  active: boolean
  label: string
  onClick: (key: string, href: string) => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => onClick(item.key, item.href)}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-semibold ${active ? 'text-primary-dark' : 'text-text-secondary'}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
