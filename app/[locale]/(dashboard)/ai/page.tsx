import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { EmptyState } from '@/components/ui/empty-state'

export default function AiPage() {
  const t = useTranslations('pages')
  return <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6"><h1 className="text-3xl font-bold text-text-primary">{t('aiTitle')}</h1><EmptyState icon={<Sparkles className="h-7 w-7" />} message={t('comingSoon')} /></div>
}
