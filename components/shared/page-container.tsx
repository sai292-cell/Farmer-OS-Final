import type { ReactNode } from 'react'
import { cn } from 'cn'

/**
 * PageContainer — consistent padding and max-width for all pages.
 * Centers content on desktop, full-width on mobile with safe gutters.
 */
export function PageContainer({
  children,
  className,
  narrow = false,
}: {
  children: ReactNode
  className?: string
  narrow?: boolean
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
        narrow ? 'max-w-2xl' : 'max-w-5xl',
        className
      )}
    >
      {children}
    </div>
  )
}
