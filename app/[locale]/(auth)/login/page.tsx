import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(`/${locale}`)
  return <AuthContent locale={locale} />
}

function AuthContent({ locale }: { locale: string }) {
  const t = useTranslations('auth')
  return (
    <section className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="space-y-2"><p className="text-sm font-semibold text-primary-dark">{t('brand')}</p><h1 className="text-3xl font-bold text-text-primary">{t('loginTitle')}</h1><p className="text-sm text-text-secondary">{t('loginDescription')}</p></div>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-text-secondary">{t('noAccount')} <Link href="/signup" locale={locale as 'en' | 'mr' | 'hi'} className="font-bold text-primary-dark underline">{t('createAccount')}</Link></p>
    </section>
  )
}
