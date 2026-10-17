import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { BoundaryMeasurement } from '@/components/maps/boundary-measurement'
import { PageContainer } from '@/components/shared/page-container'

export default async function BoundaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ farmId: string }>
  searchParams: Promise<{ plotId?: string }>
}) {
  const { farmId } = await params
  const { plotId } = await searchParams
  const t = await getTranslations('boundary')
  const supabase = await createClient()
  const [{ data: farm }, { data: latest }] = await Promise.all([
    supabase.from('farms').select('id,name,village,taluka,district,location').eq('id', farmId).single(),
    supabase
      .from('boundary_surveys')
      .select('raw_points')
      .eq('farm_id', farmId)
      .eq('plot_id', plotId || null)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!farm) {
    return (
      <PageContainer>
        <div className="rounded-3xl border border-border bg-surface p-8 text-center text-text-secondary">
          {t('farmNotFound')}
        </div>
      </PageContainer>
    )
  }

  const savedPoints = Array.isArray(latest?.raw_points)
    ? latest.raw_points
        .map((point) => {
          const value = point as { longitude?: number; latitude?: number }
          return [Number(value.longitude), Number(value.latitude)] as [number, number]
        })
        .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
    : []

  const location = farm.location as { coordinates?: [number, number] } | null

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
        {t('measureTitle', { farm: farm.name })}
      </h1>
      <BoundaryMeasurement
        farmId={farmId}
        plotId={plotId}
        initialPoints={savedPoints}
        defaultCenter={location?.coordinates}
        initialVillage={farm.village || ''}
        fallbackAreas={{ taluka: farm.taluka || '', district: farm.district || '' }}
      />
    </PageContainer>
  )
}
