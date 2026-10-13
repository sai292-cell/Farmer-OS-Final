import { Clock3 } from 'lucide-react'

export function DataFreshness({ label, exactTime }: { label: string; exactTime: string }) {
  return (
    <time dateTime={exactTime} title={exactTime} className="inline-flex items-center gap-1 text-xs text-text-secondary">
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </time>
  )
}
