import type { ReactNode } from 'react'
import { AnalyticsPageView } from '@/components/shared/analytics-page-view'
import { AppHeader } from '@/components/shared/app-header'
import { BottomNav } from '@/components/shared/bottom-nav'
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

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
