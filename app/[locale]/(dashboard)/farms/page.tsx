import { MapPinned, Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { EmptyState } from '@/components/ui/empty-state'
import { DataStatusBadge } from '@/components/ui/data-status-badge'
import { createClient } from '@/lib/supabase/server'

export default async function FarmsPage() {
  const t = await getTranslations('farms')
  const supabase = await createClient()
  const { data: farms } = await supabase.from('farms').select('id,name,village,updated_at').is('archived_at', null).order('created_at', { ascending: false })
  const { data: surveys } = farms?.length ? await supabase.from('boundary_surveys').select('farm_id,area_sqm,measured_at').in('farm_id', farms.map((farm) => farm.id)).is('plot_id', null).order('version_number', { ascending: false }) : { data: [] }
  return <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
    <div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-bold text-text-primary">{t('title')}</h1><Link href="/farms/new" className="inline-flex min-h-[48px] items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="mr-2 h-4 w-4" />{t('add')}</Link></div>
    {!farms?.length ? <EmptyState icon={<MapPinned className="h-7 w-7" />} message={t('empty')} actionLabel={t('add')} actionHref="/farms/new" /> :
      <div className="grid gap-4 sm:grid-cols-2">{farms.map((farm) => {
        const summary = surveys?.find((survey) => survey.farm_id === farm.id)
        return <Link key={farm.id} href={`/farms/${farm.id}`} className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary">
          <h2 className="text-xl font-bold text-text-primary">{farm.name}</h2><p className="mt-1 text-sm text-text-secondary">{farm.village || t('villageNotSet')}</p>
          <div className="mt-4 flex items-center justify-between gap-2"><span className="text-sm text-text-secondary">{summary?.area_sqm ? `${Number(summary.area_sqm).toFixed(0)} m²` : t('notMeasured')}</span><DataStatusBadge value={summary?.area_sqm ? 'actual' : 'unavailable'} /></div>
          {summary?.area_sqm && <p className="mt-2 text-xs text-text-secondary">{t('measuredAt')} {new Date(summary.measured_at).toLocaleDateString()}</p>}
        </Link>
      })}</div>}
  </div>
}
