'use client'

import { Bell, Sprout } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/language-switcher'

export function AppHeader() {
  const t = useTranslations('common')

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-dark to-primary text-white shadow-md shadow-primary/20">
            <Sprout className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-text-primary">{t('appName')}</p>
            <p className="hidden text-xs font-medium text-text-secondary sm:block">{t('tagline')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('notifications')}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl text-text-secondary hover:bg-primary-surface hover:text-primary-dark"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
