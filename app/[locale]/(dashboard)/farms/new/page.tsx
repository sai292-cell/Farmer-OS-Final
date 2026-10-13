import { getTranslations } from 'next-intl/server'
import { FarmForm } from '@/components/farms/farm-form'

export default async function NewFarmPage() {
  const t = await getTranslations('farms')
  return <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6"><h1 className="text-3xl font-bold text-text-primary">{t('add')}</h1><FarmForm /></div>
}
