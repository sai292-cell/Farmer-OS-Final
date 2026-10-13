import { CalendarCheck, CloudSun, Droplets, Leaf, ListTodo, MapPinned, Sprout } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { CategoryTile } from '@/components/ui/category-tile'
import { DataStatusBadge } from '@/components/ui/data-status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const t = await getTranslations('home')
  const common = await getTranslations('common')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
    : { data: null }
  const greeting = profile?.full_name ? t('greetingWithName', { name: profile.full_name }) : t('greeting')
  const quickActions = [
    { key: 'addFarm', icon: <MapPinned className="h-6 w-6" />, color: 'mint' as const },
    { key: 'logActivity', icon: <CalendarCheck className="h-6 w-6" />, color: 'peach' as const },
    { key: 'checkCrop', icon: <Leaf className="h-6 w-6" />, color: 'sky' as const },
    { key: 'askAi', icon: <Sprout className="h-6 w-6" />, color: 'lavender' as const },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold text-primary-dark">{common('appName')}</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{greeting}</h1>
        <p className="text-sm text-text-secondary">{t('comingSoon')}</p>
      </section>

      <section aria-labelledby="weather-heading" className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CloudSun className="h-7 w-7 text-primary" aria-hidden="true" />
            <div>
              <h2 id="weather-heading" className="font-bold text-text-primary">{t('weather')}</h2>
              <p className="text-sm text-text-secondary">{t('unavailable')}</p>
            </div>
          </div>
          <DataStatusBadge value="unavailable" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title={t('myFarms')} seeAll={t('seeAll')} />
        <EmptyState icon={<MapPinned className="h-6 w-6" />} message={t('emptyFarms')} actionLabel={t('addFarm')} actionHref="/farms" />
      </section>

      <section className="space-y-4">
        <SectionHeader title={t('todaysTasks')} seeAll={t('seeAll')} />
        <EmptyState icon={<ListTodo className="h-6 w-6" />} message={t('emptyTasks')} />
      </section>

      <section className="space-y-4">
        <SectionHeader title={t('quickActions')} seeAll={t('seeAll')} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <CategoryTile key={action.key} label={t(action.key)} icon={action.icon} color={action.color} />
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Droplets className="h-5 w-5 text-primary" aria-hidden="true" />
        {t('noLiveData')}
      </div>
    </div>
  )
}
