'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

type AuthMode = 'login' | 'signup'

export function AuthForm({ mode }: { mode: AuthMode }) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const schema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordTooShort')),
  })
  type Values = z.infer<typeof schema>
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: Values) => {
    setFormError(null)
    setNotice(null)
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (result.error) {
      setFormError(t('requestFailed'))
      return
    }

    analytics.trackEvent(mode === 'login' ? 'sign_in' : 'sign_up')

    if (mode === 'signup' && !result.data.session) {
      setNotice(t('checkEmail'))
      return
    }

    let destinationLocale = locale
    if (mode === 'login' && result.data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', result.data.user.id)
        .maybeSingle()
      if (profile?.preferred_language) destinationLocale = profile.preferred_language
    }
    router.push('/', { locale: destinationLocale })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-text-primary">{t('email')}</label>
        <input id="email" type="email" autoComplete="email" {...register('email')} className="min-h-14 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none ring-primary focus:ring-2" />
        {errors.email && <p className="text-sm text-status-alert">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-text-primary">{t('password')}</label>
        <div className="relative">
          <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...register('password')} className="min-h-14 w-full rounded-2xl border border-border bg-background px-4 pr-14 text-base outline-none ring-primary focus:ring-2" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 flex min-h-12 min-w-12 items-center justify-center rounded-xl text-text-secondary" aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-status-alert">{errors.password.message}</p>}
      </div>
      {formError && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-status-alert">{formError}</p>}
      {notice && <p role="status" className="rounded-2xl bg-primary-surface p-3 text-sm text-primary-dark">{notice}</p>}
      <button type="submit" disabled={isSubmitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-bold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60">
        {isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
        {mode === 'login' ? t('signIn') : t('signUp')}
      </button>
    </form>
  )
}
