import { ArrowRight } from 'lucide-react'

export function SectionHeader({ title, seeAll }: { title: string; seeAll: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <button type="button" className="flex min-h-[48px] items-center gap-1 rounded-xl px-2 text-sm font-semibold text-primary-dark">
        {seeAll}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
