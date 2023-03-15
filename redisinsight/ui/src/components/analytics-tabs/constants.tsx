import { ReactNode } from 'react'

import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { OnboardingTourOptions } from 'uiSrc/components/onboarding-tour'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

interface AnalyticsTabs {
  id: AnalyticsViewTab
  label: string | ReactNode
  onboard?: OnboardingTourOptions
}

export const analyticsViewTabs: AnalyticsTabs[] = [
  {
    id: AnalyticsViewTab.ClusterDetails,
    label: 'Overview',
    onboard: ONBOARDING_FEATURES?.ANALYTICS_OVERVIEW
  },
  {
    id: AnalyticsViewTab.DatabaseAnalysis,
    label: 'Database Analysis',
    onboard: ONBOARDING_FEATURES?.ANALYTICS_DATABASE_ANALYSIS
  },
  {
    id: AnalyticsViewTab.SlowLog,
    label: 'Slow Log',
    onboard: ONBOARDING_FEATURES?.ANALYTICS_SLOW_LOG
  },
]
