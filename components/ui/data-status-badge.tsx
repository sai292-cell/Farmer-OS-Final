import { useTranslations } from 'next-intl'

export type DataStatus = 'actual' | 'estimated' | 'forecast' | 'unavailable'

export function DataStatusBadge({ value }: { value: DataStatus }) {
  const t = useTranslations('dataStatus')
  return <span className="inline-flex min-h-[32px] items-center rounded-full border border-border bg-background px-3 text-xs font-semibold text-text-secondary">{t(value)}</span>
}
