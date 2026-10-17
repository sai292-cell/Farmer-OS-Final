import type { ReactNode } from 'react'

/**
 * StatCard — big, calm card for displaying a hero metric.
 * Icon, large readable number, label, optional trend and freshness.
 */
export function StatCard({
  value,
  label,
  trend,
  freshness,
  icon,
}: {
  value: string
  label: string
  trend?: string
  freshness?: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[--shadow-card] transition-shadow duration-200 hover:shadow-[--shadow-card-hover]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-tight text-text-primary tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-sm font-medium text-text-secondary">{label}</p>
        </div>
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-surface text-primary">
            {icon}
          </div>
        )}
      </div>
      {(trend || freshness) && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-text-muted">
          {trend && <span>{trend}</span>}
          {freshness && <span>{freshness}</span>}
        </div>
      )}
    </div>
  )
}
