import type { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import { Plus } from 'lucide-react'

/**
 * EmptyState — shown when a section has no data.
 * Uses an illustration-style icon, helpful message, and primary action.
 */
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
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/60 p-8 text-center">
      {/* Illustration-style icon circle */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-surface text-primary">
        {icon}
      </div>

      <p className="max-w-xs text-sm font-medium leading-relaxed text-text-secondary">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-primary-dark active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </button>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-primary-dark active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
