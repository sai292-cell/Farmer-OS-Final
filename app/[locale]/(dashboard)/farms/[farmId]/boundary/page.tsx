import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { BoundaryMeasurement } from '@/components/maps/boundary-measurement'

export default async function BoundaryPage({ params, searchParams }: { params: Promise<{ farmId: string }>; searchParams: Promise<{ plotId?: string }> }) {
  const { farmId } = await params
  const { plotId } = await searchParams
  const t = await getTranslations('boundary')
  const supabase = await createClient()
  const { data: farm } = await supabase.from('farms').select('id,name').eq('id', farmId).single()
  if (!farm) return <div className="p-8">{t('farmNotFound')}</div>
  return <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6"><h1 className="text-3xl font-bold text-text-primary">{t('measureTitle', { farm: farm.name })}</h1><BoundaryMeasurement farmId={farmId} plotId={plotId} /></div>
}
