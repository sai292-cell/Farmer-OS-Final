import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import { DataStatusBadge } from '@/components/ui/data-status-badge'
import { PlotForm } from '@/components/farms/plot-form'
import { FarmForm } from '@/components/farms/farm-form'
import { BoundaryHistoryMap } from '@/components/maps/boundary-history-map'
import { ArchiveButton } from '@/components/farms/archive-button'

export default async function FarmDetailPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params
  const t = await getTranslations('farms')
  const b = await getTranslations('boundary')
  const supabase = await createClient()
  const [{ data: farm }, { data: plots }, { data: surveys }] = await Promise.all([
    supabase.from('farms').select('*').eq('id', farmId).single(),
    supabase.from('plots').select('*').eq('farm_id', farmId).is('archived_at', null).order('created_at'),
    supabase.from('boundary_surveys').select('id,version_number,area_sqm,method,notes,measured_at,raw_points,polygon').eq('farm_id', farmId).is('plot_id', null).order('version_number', { ascending: false }),
  ])
  if (!farm) return <div className="p-8">{t('notFound')}</div>
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-bold text-text-primary">{farm.name}</h1><p className="text-text-secondary">{[farm.village, farm.taluka, farm.district, farm.state].filter(Boolean).join(', ')}</p></div><div className="flex flex-wrap gap-2"><Link href={`/farms/${farmId}/boundary`} className="inline-flex min-h-[48px] items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">{b('measure')}</Link><ArchiveButton table="farms" id={farmId} /></div></div>
    <section className="rounded-3xl border border-border bg-surface p-5"><h2 className="text-xl font-bold">{t('edit')}</h2><FarmForm farm={farm} /></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">{t('plots')}</h2>{plots?.map((plot) => <div key={plot.id} className="rounded-2xl border border-border bg-surface p-4"><p className="font-bold">{plot.name}</p>{plot.notes && <p className="text-sm text-text-secondary">{plot.notes}</p>}<div className="mt-2 flex flex-wrap items-center gap-3"><Link href={`/farms/${farmId}/boundary?plotId=${plot.id}`} className="inline-flex min-h-[48px] items-center text-sm font-semibold text-primary-dark">{b('measurePlot')}</Link><ArchiveButton table="plots" id={plot.id} /></div></div>)}<PlotForm farmId={farmId} /></section>
    <section className="space-y-4"><h2 className="text-xl font-bold">{b('history')}</h2><p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{b('legalNotice')}</p>{surveys?.map((survey) => <div key={survey.id} className="rounded-2xl border border-border bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">{b('recordVersion', { version: survey.version_number })}</h3><p className="text-sm text-text-secondary">{new Date(survey.measured_at).toLocaleString()} · {survey.method === 'walked_gps' ? b('walked_gps') : b('drawn_on_map')}</p></div><DataStatusBadge value="actual" /></div><p className="mt-2 text-sm">{Number(survey.area_sqm).toFixed(2)} m²</p>{survey.notes && <p className="text-sm text-text-secondary">{survey.notes}</p>}<BoundaryHistoryMap survey={survey} /></div>)}</section>
  </div>
}
