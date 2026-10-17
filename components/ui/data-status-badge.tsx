'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, TrendingUp, HelpCircle } from 'lucide-react'

export type DataStatus = 'actual' | 'estimated' | 'forecast' | 'unavailable'

const config: Record<DataStatus, { icon: typeof CheckCircle2; bg: string; text: string }> = {
  actual: { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-status-verified' },
  estimated: { icon: Clock, bg: 'bg-blue-50', text: 'text-status-actual' },
  forecast: { icon: TrendingUp, bg: 'bg-purple-50', text: 'text-status-forecast' },
  unavailable: { icon: HelpCircle, bg: 'bg-gray-50', text: 'text-status-unavailable' },
}

export function DataStatusBadge({ value }: { value: DataStatus }) {
  const t = useTranslations('dataStatus')
  const { icon: Icon, bg, text } = config[value]
  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(value)}
    </span>
  )
}
