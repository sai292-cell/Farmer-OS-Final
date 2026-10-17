import type { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import { Lock } from 'lucide-react'

const bgColors = {
  mint: 'bg-pastel-mint',
  peach: 'bg-pastel-peach',
  sky: 'bg-pastel-sky',
  lavender: 'bg-pastel-lavender',
  amber: 'bg-pastel-amber',
  rose: 'bg-pastel-rose',
} as const

/**
 * ActionTile — big icon tile for quick actions.
 * Always shows icon + short word. "Coming soon" tiles show a lock and are not clickable.
 */
export function ActionTile({
  label,
  icon,
  color = 'mint',
  href,
  onClick,
  comingSoon,
  comingSoonLabel,
}: {
  label: string
  icon: ReactNode
  color?: keyof typeof bgColors
  href?: string
  onClick?: () => void
  comingSoon?: boolean
  comingSoonLabel?: string
}) {
  const baseClasses = `flex min-h-[112px] w-full flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center transition-all duration-200 ${bgColors[color]}`

  if (comingSoon) {
    return (
      <div
        className={`${baseClasses} cursor-default opacity-60`}
        aria-disabled="true"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/60">
          {icon}
        </div>
        <span className="text-xs font-bold text-text-primary">{label}</span>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-text-muted">
          <Lock className="h-3 w-3" aria-hidden="true" />
          {comingSoonLabel}
        </span>
      </div>
    )
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} hover:shadow-[--shadow-card] active:scale-[0.97]`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/60">
          {icon}
        </div>
        <span className="text-xs font-bold text-text-primary">{label}</span>
      </Link>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} hover:shadow-[--shadow-card] active:scale-[0.97]`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/60">
          {icon}
        </div>
        <span className="text-xs font-bold text-text-primary">{label}</span>
      </button>
    )
  }

  return (
    <div className={baseClasses}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/60">
        {icon}
      </div>
      <span className="text-xs font-bold text-text-primary">{label}</span>
    </div>
  )
}
