import type { ReactNode } from 'react'
import { AnalyticsPageView } from '@/components/shared/analytics-page-view'
import { AppHeader } from '@/components/shared/app-header'
import { BottomNav } from '@/components/shared/bottom-nav'
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnalyticsPageView />
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 pb-24 lg:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
