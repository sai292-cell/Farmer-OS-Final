export function ConfidenceMeter({ value, label }: { value?: number; label: string }) {
  const safeValue = value === undefined ? 0 : Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-sm font-semibold text-text-secondary">
        <span>{label}</span>
        <span>{value === undefined ? '—' : `${safeValue}%`}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-primary-surface" aria-label={label}>
        <div className="h-full rounded-full bg-primary" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}
