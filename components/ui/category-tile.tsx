import type { ReactNode } from 'react'
import { ActionTile } from './action-tile'

export function CategoryTile({
  label,
  icon,
  color = 'mint',
  onClick,
  href,
}: {
  label: string
  icon: ReactNode
  color?: 'mint' | 'peach' | 'sky' | 'lavender' | 'amber' | 'rose'
  onClick?: () => void
  href?: string
}) {
  return <ActionTile label={label} icon={icon} color={color} onClick={onClick} href={href} />
}
