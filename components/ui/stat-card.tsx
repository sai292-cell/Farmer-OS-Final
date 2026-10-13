import type { ReactNode } from 'react'

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
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-tight text-text-primary">{value}</p>
          <p className="mt-1 text-sm font-medium text-text-secondary">{label}</p>
        </div>
        {icon && <div className="rounded-2xl bg-primary-surface p-3 text-primary-dark">{icon}</div>}
      </div>
      {(trend || freshness) && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-text-secondary">
          {trend && <span>{trend}</span>}
          {freshness && <span>{freshness}</span>}
        </div>
      )}
    </div>
  )
}
