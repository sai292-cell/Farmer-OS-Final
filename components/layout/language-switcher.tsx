'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useTransition } from 'react'
import { analytics } from '@/lib/analytics'

export function LanguageSwitcher() {
  const t = useTranslations('common')
  const currentLocale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिंदी' },
  ] as const

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
    <div className="flex items-center gap-1.5 bg-secondary/80 p-1.5 rounded-2xl border border-border shadow-xs">
      <div className="flex items-center justify-center pl-2 pr-1 text-primary-dark">
        <Globe className="w-5 h-5 text-primary" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1">
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code
          return (
            <button
              key={lang.code}
              type="button"
              disabled={isPending}
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={t('switchTo', { language: lang.label })}
              className={`min-h-[48px] min-w-[56px] px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'bg-transparent text-text-primary hover:bg-primary-surface hover:text-primary-dark'
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
