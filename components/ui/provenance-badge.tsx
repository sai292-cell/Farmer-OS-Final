'use client'

import { useTranslations } from 'next-intl'
import { UserCheck, Sparkles, ShieldCheck, Award } from 'lucide-react'

export type Provenance = 'farmerEntered' | 'aiSuggestion' | 'verified' | 'expertConfirmed'

const config: Record<Provenance, { icon: typeof UserCheck; bg: string; text: string; border: string }> = {
  farmerEntered: { icon: UserCheck, bg: 'bg-[#F4F7F4]', text: 'text-text-secondary', border: 'border-border' },
  aiSuggestion: { icon: Sparkles, bg: 'bg-pastel-lavender/30', text: 'text-purple-800', border: 'border-purple-200' },
  verified: { icon: ShieldCheck, bg: 'bg-primary-surface', text: 'text-primary-dark', border: 'border-primary-light/40' },
  expertConfirmed: { icon: Award, bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
}

export function ProvenanceBadge({ value }: { value: Provenance }) {
  const t = useTranslations('provenance')
  const { icon: Icon, bg, text, border } = config[value] ?? config.farmerEntered

  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bg} ${text} ${border}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {t(value)}
    </span>
  )
}
