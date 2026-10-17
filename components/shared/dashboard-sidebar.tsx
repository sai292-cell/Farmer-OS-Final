'use client'

import {
  Activity,
  Award,
  BookOpen,
  Camera,
  ChevronRight,
  CloudRain,
  Compass,
  Cpu,
  Droplets,
  FileCheck,
  House,
  Info,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Tractor,
  Truck,
  User,
  UserCheck,
  Users,
  Wheat,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { analytics } from '@/lib/analytics'
import { useSidebar } from '@/components/shared/sidebar-context'
import { useState } from 'react'

interface SidebarProps {
  profile?: {
    full_name?: string | null
    village?: string | null
    state?: string | null
    profile_completed?: boolean
  } | null
}

interface FeatureItem {
  key: string
  labelKey: string
  href?: string
  icon: typeof House
  stage?: string
  isPlanned?: boolean
  description?: string
}

interface FeatureSection {
  titleKey: string
  items: FeatureItem[]
}

export function DashboardSidebar({ profile }: SidebarProps) {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, close } = useSidebar()
  const [selectedPlannedFeature, setSelectedPlannedFeature] = useState<FeatureItem | null>(null)

  const sections: FeatureSection[] = [
    {
      titleKey: 'coreSection',
      items: [
        { key: 'home', labelKey: 'home', href: '/', icon: House },
        { key: 'farms', labelKey: 'farms', href: '/farms', icon: Sprout },
        { key: 'ai', labelKey: 'ai', href: '/ai', icon: Sparkles },
        { key: 'activity', labelKey: 'activity', href: '/activity', icon: Activity },
        { key: 'profile', labelKey: 'profile', href: '/profile', icon: UserCheck },
      ],
    },
    {
      titleKey: 'cropSection',
      items: [
        {
          key: 'cropDiary',
          labelKey: 'cropDiary',
          icon: Wheat,
          stage: 'Stage 2',
          isPlanned: true,
          description: 'Plot-level crop plans, 60-second quick event logger, growth stage calendars, and photo journal.',
        },
        {
          key: 'irrigation',
          labelKey: 'irrigation',
          icon: Droplets,
          stage: 'Stage 2',
          isPlanned: true,
          description: 'Crop-specific watering schedules, irrigation logs, pump running hours, and water source registries.',
        },
        {
          key: 'sprayLog',
          labelKey: 'sprayLog',
          icon: FileCheck,
          stage: 'Stage 2',
          isPlanned: true,
          description: 'Verified package of practice, chemical spray records, pre-spray weather checks, and safety wait periods.',
        },
        {
          key: 'farmMachinery',
          labelKey: 'farmMachinery',
          icon: Tractor,
          stage: 'Stage 2',
          isPlanned: true,
          description: 'Custom Hiring Centre (CHC) tractor booking, equipment rental sharing, and machinery operating cost analysis.',
        },
      ],
    },
    {
      titleKey: 'financeSection',
      items: [
        {
          key: 'farmFinance',
          labelKey: 'farmFinance',
          icon: BookOpen,
          stage: 'Stage 3',
          isPlanned: true,
          description: 'Crop-wise budgets, actual expense tracking, harvest sales ledgers, and break-even calculators.',
        },
        {
          key: 'mandiPrices',
          labelKey: 'mandiPrices',
          icon: Store,
          stage: 'Stage 4',
          isPlanned: true,
          description: 'Verified APMC / Mandi daily prices, Minimum Support Price (MSP) benchmarks, and net realization estimates.',
        },
      ],
    },
    {
      titleKey: 'govSection',
      items: [
        {
          key: 'govSchemes',
          labelKey: 'govSchemes',
          icon: Award,
          stage: 'Stage 4 & Q',
          isPlanned: true,
          description: 'Central & State agricultural scheme finder, eligibility assistant, required document checklists, and official portals.',
        },
        {
          key: 'pmfbyInsurance',
          labelKey: 'pmfbyInsurance',
          icon: ShieldCheck,
          stage: 'Stage 4 & Y',
          isPlanned: true,
          description: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) policy tracking, localized calamity damage documentation, and claim evidence.',
        },
        {
          key: 'soilHealth',
          labelKey: 'soilHealth',
          icon: Sprout,
          stage: 'Stage 4',
          isPlanned: true,
          description: 'Digital Soil Health Card interpreter, nutrient dosage calculators, and laboratory test result records.',
        },
      ],
    },
    {
      titleKey: 'precisionSection',
      items: [
        {
          key: 'diseaseScan',
          labelKey: 'diseaseScan',
          icon: Camera,
          stage: 'Stage 5',
          isPlanned: true,
          description: 'Camera screening for crop pests and nutrient deficiencies with explicit confidence scores and human agronomist escalation.',
        },
        {
          key: 'satelliteNdvi',
          labelKey: 'satelliteNdvi',
          icon: Compass,
          stage: 'Stage 7',
          isPlanned: true,
          description: 'Open satellite remote sensing (Sentinel-2 / Landsat), Vegetation Index (NDVI) vigor maps, and field anomaly detection.',
        },
        {
          key: 'digitalTwin',
          labelKey: 'digitalTwin',
          icon: Cpu,
          stage: 'Stage 8',
          isPlanned: true,
          description: 'AI farm digital twin virtual state model, historical replay, and predictive operational briefing.',
        },
      ],
    },
    {
      titleKey: 'ecosystemSection',
      items: [
        {
          key: 'community',
          labelKey: 'community',
          icon: Users,
          stage: 'Stage 6',
          isPlanned: true,
          description: 'Farmer-to-farmer crop discussion groups, experienced peer mentorship, and verified agronomist consultations.',
        },
        {
          key: 'transport',
          labelKey: 'transport',
          icon: Truck,
          stage: 'Stage 6',
          isPlanned: true,
          description: 'Farm-to-mandi transport logistics, licensed warehouse locator, and cold storage availability.',
        },
      ],
    },
    {
      titleKey: 'devSection',
      items: [
        {
          key: 'villageMap',
          labelKey: 'villageMap',
          href: '/dev/map-test',
          icon: MapPinned,
          stage: 'Active Dev',
          isPlanned: false,
        },
      ],
    },
  ]

  const handleLinkClick = (key: string, href?: string) => {
    if (href) {
      analytics.trackEvent('sidebar_navigation_used', { destination: key })
      close()
    }
  }

  const handlePlannedClick = (item: FeatureItem) => {
    analytics.trackEvent('planned_feature_inspected', { feature: item.key })
    setSelectedPlannedFeature(item)
  }

  const farmerName = profile?.full_name || 'Farmer'
  const farmerLocation = [profile?.village, profile?.state].filter(Boolean).join(', ')

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
      <div className="space-y-6">
        {/* Profile Card Header */}
        <Link
          href="/profile"
          onClick={() => {
            analytics.trackEvent('sidebar_profile_clicked')
            close()
          }}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-primary-surface/40 p-3.5 shadow-xs transition-all duration-200 hover:border-primary hover:bg-primary-surface/80"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white font-black shadow-xs">
              {farmerName[0]?.toUpperCase() || <User className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary group-hover:text-primary-dark">
                {farmerName}
              </p>
              <p className="truncate text-xs font-medium text-text-secondary">
                {farmerLocation || t('manageProfile')}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        {/* Feature Navigation Sections */}
        <nav aria-label={t('label')} className="space-y-5">
          {sections.map((section) => (
            <div key={section.titleKey} className="space-y-1.5">
              <p className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                {t(section.titleKey)}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = item.href ? (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)) : false

                  if (item.isPlanned) {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handlePlannedClick(item)}
                        className="group flex min-h-[44px] w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-text-secondary transition-colors duration-150 hover:bg-background hover:text-text-primary"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-text-muted group-hover:text-primary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="truncate">{t(item.labelKey)}</span>
                        </div>
                        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-text-muted">
                          {t('planned')}
                        </span>
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.key}
                      href={item.href || '/'}
                      onClick={() => handleLinkClick(item.key, item.href)}
                      className={`flex min-h-[44px] items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors duration-150 ${
                        active
                          ? 'bg-primary-surface text-primary-dark font-extrabold'
                          : 'text-text-secondary hover:bg-background hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            active ? 'bg-primary/10 text-primary-dark' : 'bg-surface text-text-secondary'
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="truncate">{t(item.labelKey)}</span>
                      </div>
                      {item.stage && (
                        <span className="shrink-0 rounded-md bg-primary-surface px-1.5 py-0.5 text-[10px] font-bold text-primary-dark">
                          {item.stage}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Transparency Badge */}
      <div className="mt-6 border-t border-border/60 pt-3 px-1 text-[11px] font-medium text-text-muted flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>{t('privateBadge')}</span>
        </span>
        <span>v0.1.0</span>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-surface lg:block sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-surface shadow-elevated">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-extrabold text-primary-dark">FarmerOS Menu</span>
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* Planned Feature Info Modal */}
      {selectedPlannedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedPlannedFeature(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-elevated space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-surface text-primary-dark">
                  <selectedPlannedFeature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {t(selectedPlannedFeature.labelKey)}
                  </h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-text-secondary">
                    {selectedPlannedFeature.stage}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlannedFeature(null)}
                className="rounded-xl p-1 text-text-muted hover:bg-background"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-text-secondary font-medium">
              {selectedPlannedFeature.description}
            </p>

            <div className="flex items-start gap-2 rounded-2xl border border-border bg-background p-3 text-[11px] font-medium text-text-muted">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>
                FarmerOS adheres to real-world verified data standards. Live functionality will connect when official packages and APIs are integrated.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlannedFeature(null)}
              className="flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-primary font-bold text-white hover:bg-primary-dark text-xs"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </>
  )
}
