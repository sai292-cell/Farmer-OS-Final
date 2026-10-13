import type { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export function EmptyState({
  icon,
  message,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon: ReactNode
  message: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/70 p-6 text-center">
      <div className="mb-3 rounded-2xl bg-primary-surface p-3 text-primary-dark">{icon}</div>
      <p className="max-w-sm text-sm leading-6 text-text-secondary">{message}</p>
      {actionLabel && onAction && <Button type="button" onClick={onAction} className="mt-4 min-h-[48px] rounded-2xl px-5">{actionLabel}</Button>}
      {actionLabel && actionHref && <Link href={actionHref} className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark">{actionLabel}</Link>}
    </div>
  )
}
