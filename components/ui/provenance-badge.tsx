import { useTranslations } from 'next-intl'

export type Provenance = 'farmerEntered' | 'aiSuggestion' | 'verified' | 'expertConfirmed'

export function ProvenanceBadge({ value }: { value: Provenance }) {
  const t = useTranslations('provenance')
  return <span className="inline-flex min-h-[32px] items-center rounded-full border border-border bg-background px-3 text-xs font-semibold text-text-secondary">{t(value)}</span>
}
