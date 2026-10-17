import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import { DataStatusBadge } from '@/components/ui/data-status-badge'
import { PlotForm } from '@/components/farms/plot-form'
import { FarmForm } from '@/components/farms/farm-form'
import { BoundaryHistoryMap } from '@/components/maps/boundary-history-map'
import { ArchiveButton } from '@/components/farms/archive-button'
import { PageContainer } from '@/components/shared/page-container'
import { Compass, MapPin } from 'lucide-react'

export default async function FarmDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ farmId: string }>
  searchParams: Promise<{ boundarySaved?: string }>
}) {
  const { farmId } = await params
  const { boundarySaved } = await searchParams
  const t = await getTranslations('farms')
  const b = await getTranslations('boundary')
  const supabase = await createClient()
  const [{ data: farm }, { data: plots }, { data: surveys }] = await Promise.all([
    supabase.from('farms').select('*').eq('id', farmId).single(),
    supabase.from('plots').select('*').eq('farm_id', farmId).is('archived_at', null).order('created_at'),
    supabase
      .from('boundary_surveys')
      .select('id,version_number,area_sqm,method,notes,measured_at,raw_points,polygon')
      .eq('farm_id', farmId)
      .is('plot_id', null)
      .order('version_number', { ascending: false }),
  ])

  if (!farm) {
    return (
      <PageContainer>
        <div className="rounded-3xl border border-border bg-surface p-8 text-center text-text-secondary">
          {t('notFound')}
        </div>
      </PageContainer>
    )
  }

  const locationText = [farm.village, farm.taluka, farm.district, farm.state].filter(Boolean).join(', ')

  return (
    <PageContainer className="space-y-8">
      {/* Header with Title & Primary Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
            {farm.name}
          </h1>
          {locationText && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{locationText}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/farms/${farmId}/boundary`}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>{b('measure')}</span>
          </Link>
          <ArchiveButton table="farms" id={farmId} />
        </div>
      </div>

      {/* Farm Edit Section */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-xl font-bold text-text-primary">{t('edit')}</h2>
        <FarmForm farm={farm} />
      </section>

      {/* Plots Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">{t('plots')}</h2>
        {plots?.map((plot) => (
          <div
            key={plot.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center gap-4"
          >
            <div>
              <p className="text-base font-bold text-text-primary">{plot.name}</p>
              {plot.notes && <p className="mt-0.5 text-xs text-text-secondary">{plot.notes}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/farms/${farmId}/boundary?plotId=${plot.id}`}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary-surface px-4 text-xs font-bold text-primary-dark transition-colors duration-200 hover:bg-primary-surface/80"
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{b('measurePlot')}</span>
              </Link>
              <ArchiveButton table="plots" id={plot.id} />
            </div>
          </div>
        ))}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
          <PlotForm farmId={farmId} />
        </div>
      </section>

      {/* Boundary History Section */}
      <section id="boundary-history" className="scroll-mt-6 space-y-4">
        <h2 className="text-xl font-bold text-text-primary">{b('history')}</h2>
        {boundarySaved && (
          <p className="rounded-2xl border border-primary bg-primary-surface p-4 text-sm font-semibold text-primary-dark shadow-sm">
            {b('saved')}
          </p>
        )}
        <p className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm">
          {b('legalNotice')}
        </p>
        {surveys?.map((survey) => (
          <div
            key={survey.id}
            className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {b('recordVersion', { version: survey.version_number })}
                </h3>
                <p className="text-xs font-medium text-text-muted">
                  {new Date(survey.measured_at).toLocaleString()} ·{' '}
                  {survey.method === 'walked_gps' ? b('walked_gps') : b('drawn_on_map')}
                </p>
              </div>
              <DataStatusBadge value="actual" />
            </div>
            <p className="text-2xl font-extrabold text-primary-dark tabular-nums">
              {Number(survey.area_sqm).toFixed(2)} m²
            </p>
            {survey.notes && <p className="text-xs font-medium text-text-secondary">{survey.notes}</p>}
            <BoundaryHistoryMap survey={survey} />
          </div>
        ))}
      </section>
    </PageContainer>
  )
}
