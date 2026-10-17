'use client'

import { Bell, Menu, Sprout, User, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useSidebar } from '@/components/shared/sidebar-context'

interface AppHeaderProps {
  profile?: {
    full_name?: string | null
    village?: string | null
    state?: string | null
    profile_completed?: boolean
  } | null
}

export function AppHeader({ profile }: AppHeaderProps) {
  const t = useTranslations('common')
  const nav = useTranslations('navigation')
  const { isOpen, toggle } = useSidebar()

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : null

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left side: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={isOpen ? nav('close') : nav('menu')}
            aria-expanded={isOpen}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-text-primary transition-colors duration-200 hover:bg-primary-surface hover:text-primary-dark lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-dark to-primary text-white shadow-md shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-text-primary leading-tight group-hover:text-primary-dark transition-colors">
                {t('appName')}
              </p>
              <p className="hidden text-[11px] font-semibold text-text-muted sm:block">
                {t('tagline')}
              </p>
            </div>
          </Link>
        </div>

        {/* Right side: Language Switcher, Notifications, Profile Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />

          <button
            type="button"
            aria-label={t('notifications')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-text-secondary transition-colors duration-200 hover:bg-primary-surface hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Profile Icon / Avatar Button */}
          <Link
            href="/profile"
            aria-label={nav('manageProfile')}
            title={profile?.full_name || nav('manageProfile')}
            className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary-surface text-primary-dark shadow-xs transition-all duration-200 hover:border-primary hover:scale-105 active:scale-95"
          >
            {initials ? (
              <span className="text-xs font-black tracking-wider text-primary-dark">{initials}</span>
            ) : (
              <User className="h-5 w-5 text-primary-dark" aria-hidden="true" />
            )}
            {/* Status indicator dot */}
            <span
              className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                profile?.profile_completed ? 'bg-primary' : 'bg-amber-500'
              }`}
              title={profile?.profile_completed ? 'Profile complete' : 'Profile needs review'}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
