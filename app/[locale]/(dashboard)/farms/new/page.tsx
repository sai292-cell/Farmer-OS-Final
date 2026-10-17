import { getTranslations } from 'next-intl/server'
import { FarmForm } from '@/components/farms/farm-form'
import { PageContainer } from '@/components/shared/page-container'

export default async function NewFarmPage() {
  const t = await getTranslations('farms')
  return (
    <PageContainer narrow className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
        {t('add')}
      </h1>
      <FarmForm />
    </PageContainer>
  )
}
