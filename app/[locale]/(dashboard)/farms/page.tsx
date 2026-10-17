import { MapPinned, Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { EmptyState } from '@/components/ui/empty-state'
import { DataStatusBadge } from '@/components/ui/data-status-badge'
import { PageContainer } from '@/components/shared/page-container'
import { createClient } from '@/lib/supabase/server'

export default async function FarmsPage() {
  const t = await getTranslations('farms')
  const supabase = await createClient()
  const { data: farms } = await supabase
    .from('farms')
    .select('id,name,village,updated_at')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
  const { data: surveys } = farms?.length
    ? await supabase
        .from('boundary_surveys')
        .select('farm_id,area_sqm,measured_at')
        .in('farm_id', farms.map((farm) => farm.id))
        .is('plot_id', null)
        .order('version_number', { ascending: false })
    : { data: [] }

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
          {t('title')}
        </h1>
        <Link
          href="/farms/new"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{t('add')}</span>
        </Link>
      </div>

      {!farms?.length ? (
        <EmptyState
          icon={<MapPinned className="h-7 w-7 text-primary" />}
          message={t('empty')}
          actionLabel={t('add')}
          actionHref="/farms/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {farms.map((farm) => {
            const summary = surveys?.find((survey) => survey.farm_id === farm.id)
            return (
              <Link
                key={farm.id}
                href={`/farms/${farm.id}`}
                className="group flex flex-col justify-between rounded-3xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:border-primary hover:shadow-card-hover"
              >
                <div>
                  <h2 className="text-lg font-bold text-text-primary group-hover:text-primary-dark">
                    {farm.name}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-text-secondary sm:text-sm">
                    {farm.village || t('villageNotSet')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-text-primary tabular-nums sm:text-sm">
                      {summary?.area_sqm ? `${Number(summary.area_sqm).toFixed(0)} m²` : t('notMeasured')}
                    </span>
                    <DataStatusBadge value={summary?.area_sqm ? 'actual' : 'unavailable'} />
                  </div>
                  {summary?.area_sqm && (
                    <p className="mt-1.5 text-[11px] font-medium text-text-muted">
                      {t('measuredAt')} {new Date(summary.measured_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
