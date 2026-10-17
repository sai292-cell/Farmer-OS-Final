import { Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer } from '@/components/shared/page-container'

export default function ActivityPage() {
  const t = useTranslations('pages')
  return (
    <PageContainer className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
        {t('activityTitle')}
      </h1>
      <EmptyState
        icon={<Activity className="h-8 w-8 text-primary" />}
        message={t('comingSoon')}
      />
    </PageContainer>
  )
}
