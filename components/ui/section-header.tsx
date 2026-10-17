import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * SectionHeader — section title with optional "see all" action.
 */
export function SectionHeader({
  title,
  seeAll,
  seeAllHref,
  icon,
}: {
  title: string
  seeAll?: string
  seeAllHref?: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-primary" aria-hidden="true">
            {icon}
          </span>
        )}
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      </div>
      {seeAll && (
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary-surface"
        >
          {seeAll}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
