import { MapPinned } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui/empty-state'

export default function FarmsPage() {
  const t = useTranslations('pages')
  return <PlaceholderPage title={t('farmsTitle')} message={t('comingSoon')} icon={<MapPinned className="h-7 w-7" />} />
}

function PlaceholderPage({ title, message, icon }: { title: string; message: string; icon: ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6"><h1 className="text-3xl font-bold text-text-primary">{title}</h1><EmptyState icon={icon} message={message} /></div>
}
