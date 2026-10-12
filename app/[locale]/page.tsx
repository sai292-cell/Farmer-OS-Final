import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { BackendStatusCard } from '@/components/dashboard/backend-status-card'
import { Sprout, ShieldCheck, Layers, Sparkles } from 'lucide-react'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomeContent />
}

function HomeContent() {
  const t = useTranslations('home')
  const common = useTranslations('common')

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border py-3.5 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
                  {common('appName')}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-surface text-primary-dark border border-primary/20">
                  PWA Core
                </span>
              </div>
              <p className="text-xs text-text-secondary font-medium">
                {common('tagline')}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-surface via-surface to-background border border-border p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary-dark font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('foundationActive')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {t('welcome')}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Decorative agricultural pattern background */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Backend Status Card (Live Real Supabase Check) */}
        <section aria-labelledby="backend-status-heading">
          <BackendStatusCard />
        </section>

        {/* Core Architecture Chain Pillars (Design Theme Preview) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-pastel-mint/50 border border-pastel-mint text-text-primary space-y-1">
            <div className="w-8 h-8 rounded-xl bg-primary-dark/10 flex items-center justify-center text-primary-dark font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm">Land & Plots</h3>
            <p className="text-xs text-text-secondary">GPS boundary & evidence vault</p>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-sky/50 border border-pastel-sky text-text-primary space-y-1">
            <div className="w-8 h-8 rounded-xl bg-status-actual/10 flex items-center justify-center text-status-actual font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm">Crop Operations</h3>
            <p className="text-xs text-text-secondary">Watering & spray diaries</p>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-amber/50 border border-pastel-amber text-text-primary space-y-1">
            <div className="w-8 h-8 rounded-xl bg-status-warning/10 flex items-center justify-center text-status-warning font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm">Farm Money</h3>
            <p className="text-xs text-text-secondary">Realized crop profit & loss</p>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-lavender/50 border border-pastel-lavender text-text-primary space-y-1">
            <div className="w-8 h-8 rounded-xl bg-status-forecast/10 flex items-center justify-center text-status-forecast font-bold text-xs">
              04
            </div>
            <h3 className="font-bold text-sm">Decision AI</h3>
            <p className="text-xs text-text-secondary">Guardrails & expert escalation</p>
          </div>
        </div>

        {/* Provenance Footer Notice */}
        <div className="text-center py-4 text-xs text-text-secondary flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>{t('provenanceNotice')}</span>
        </div>
      </main>
    </div>
  )
}
