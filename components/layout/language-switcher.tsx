'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useTransition } from 'react'
import { analytics } from '@/lib/analytics'

const languages = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'mr', label: 'म', fullLabel: 'मराठी' },
  { code: 'hi', label: 'हि', fullLabel: 'हिंदी' },
] as const

export function LanguageSwitcher() {
  const t = useTranslations('common')
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: 'en' | 'mr' | 'hi') => {
    if (newLocale === currentLocale) return

    analytics.trackEvent('language_changed', {
      from: currentLocale,
      to: newLocale,
    })

    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border bg-background p-0.5">
      <div className="flex items-center justify-center pl-1.5 pr-0.5 text-primary" aria-hidden="true">
        <Globe className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code
          return (
            <button
              key={lang.code}
              type="button"
              disabled={isPending}
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={t('switchTo', { language: lang.fullLabel })}
              aria-pressed={isActive}
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-primary-surface hover:text-primary-dark'
              } disabled:opacity-60`}
            >
              {lang.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
