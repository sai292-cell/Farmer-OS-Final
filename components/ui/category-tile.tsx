import type { ReactNode } from 'react'

const colors = {
  mint: 'bg-pastel-mint border-pastel-mint',
  peach: 'bg-pastel-peach border-pastel-peach',
  sky: 'bg-pastel-sky border-pastel-sky',
  lavender: 'bg-pastel-lavender border-pastel-lavender',
  amber: 'bg-pastel-amber border-pastel-amber',
} as const

export function CategoryTile({
  label,
  icon,
  color = 'mint',
  onClick,
}: {
  label: string
  icon: ReactNode
  color?: keyof typeof colors
  onClick?: () => void
}) {
  const className = `flex min-h-[112px] flex-col items-start justify-between rounded-3xl border p-4 text-left text-sm font-semibold text-text-primary ${colors[color]}`
  if (onClick) {
    return <button type="button" onClick={onClick} className={className}>{icon}<span>{label}</span></button>
  }
  return <div className={className}>{icon}<span>{label}</span></div>
}
