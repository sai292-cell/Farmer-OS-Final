import { CalendarCheck, CloudSun, Droplets, Leaf, ListTodo, MapPinned, Sprout } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ActionTile } from '@/components/ui/action-tile'
import { DataStatusBadge } from '@/components/ui/data-status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeader } from '@/components/ui/section-header'
import { PageContainer } from '@/components/shared/page-container'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/routing'
import dynamic from 'next/dynamic'

const FarmAreaChart = dynamic(() => import('@/components/charts/farm-area-chart').then((module) => module.FarmAreaChart))

export default async function HomePage() {
  const t = await getTranslations('home')
  const common = await getTranslations('common')
  const farmsT = await getTranslations('farms')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
    : { data: null }
  const { data: farms } = user
    ? await supabase.from('farms').select('id,name').is('archived_at', null).order('created_at', { ascending: false })
    : { data: [] }
  const { data: surveys } = farms?.length
    ? await supabase
        .from('boundary_surveys')
        .select('farm_id,area_sqm')
        .in('farm_id', farms.map((farm) => farm.id))
        .is('plot_id', null)
        .order('version_number', { ascending: false })
    : { data: [] }

  const greeting = profile?.full_name ? t('greetingWithName', { name: profile.full_name }) : t('greeting')

  const quickActions = [
    { key: 'addFarm' as const, icon: <MapPinned className="h-6 w-6 text-primary-dark" />, color: 'mint' as const, href: '/farms/new' },
    { key: 'logActivity' as const, icon: <CalendarCheck className="h-6 w-6 text-orange-700" />, color: 'peach' as const, href: '/activity' },
    { key: 'checkCrop' as const, icon: <Leaf className="h-6 w-6 text-blue-700" />, color: 'sky' as const, href: '/crops', comingSoon: true },
    { key: 'askAi' as const, icon: <Sprout className="h-6 w-6 text-purple-700" />, color: 'lavender' as const, href: '/ai' },
  ]

  return (
    <PageContainer className="space-y-8">
      {/* Hero Greeting Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-surface/60 via-surface to-surface p-6 shadow-card sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-dark">
            <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{common('appName')}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
            {greeting}
          </h1>
          <p className="text-sm font-medium text-text-secondary max-w-xl">
            {t('comingSoon')}
          </p>
        </div>
      </section>

      {/* Weather Snapshot (Honest / Verified notice) */}
      <section aria-labelledby="weather-heading" className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pastel-sky/60 text-blue-700">
              <CloudSun className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="weather-heading" className="text-base font-bold text-text-primary">
                {t('weather')}
              </h2>
              <p className="text-xs font-medium text-text-secondary sm:text-sm">
                {t('unavailable')}
              </p>
            </div>
          </div>
          <DataStatusBadge value="unavailable" />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <SectionHeader title={t('quickActions')} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <ActionTile
              key={action.key}
              label={t(action.key)}
              icon={action.icon}
              color={action.color}
              href={action.href}
              comingSoon={action.comingSoon}
              comingSoonLabel={t('comingSoonShort')}
            />
          ))}
        </div>
      </section>

      {/* My Farms */}
      <section className="space-y-4">
        <SectionHeader title={t('myFarms')} seeAll={t('seeAll')} seeAllHref="/farms" />
        {!farms?.length ? (
          <EmptyState
            icon={<MapPinned className="h-7 w-7 text-primary" />}
            message={t('emptyFarms')}
            actionLabel={t('addFarm')}
            actionHref="/farms/new"
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {farms.slice(0, 3).map((farm) => {
                const survey = surveys?.find((s) => s.farm_id === farm.id)
                return (
                  <Link
                    key={farm.id}
                    href={`/farms/${farm.id}`}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:border-primary hover:shadow-card-hover"
                  >
                    <div>
                      <p className="text-base font-bold text-text-primary group-hover:text-primary-dark">
                        {farm.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-text-secondary">
                        {survey?.area_sqm ? `${Number(survey.area_sqm).toFixed(0)} m²` : farmsT('notMeasured')}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-dark group-hover:underline">
                        {t('viewDetails')} →
                      </span>
                      <DataStatusBadge value={survey?.area_sqm ? 'actual' : 'unavailable'} />
                    </div>
                  </Link>
                )
              })}
            </div>
            {surveys?.length ? (
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
                <p className="mb-2 text-xs font-bold text-text-secondary">{t('farmAreaChartTitle')}</p>
                <FarmAreaChart
                  data={farms
                    .map((farm) => ({
                      name: farm.name,
                      area: Number(surveys.find((survey) => survey.farm_id === farm.id)?.area_sqm || 0),
                    }))
                    .filter((item) => item.area > 0)}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Today's Tasks */}
      <section className="space-y-4">
        <SectionHeader title={t('todaysTasks')} />
        <EmptyState
          icon={<ListTodo className="h-7 w-7 text-primary" />}
          message={t('emptyTasks')}
        />
      </section>

      {/* Honesty / Real data notice */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface/50 px-4 py-3 text-xs font-medium text-text-secondary">
        <Droplets className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>{t('noLiveData')}</span>
      </div>
    </PageContainer>
  )
}
