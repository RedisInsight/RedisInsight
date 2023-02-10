import React, { ReactNode } from 'react'
import { useSelector } from 'react-redux'

import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { appFeatureHighlightingSelector } from 'uiSrc/slices/app/features'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { getHighlightingFeatures } from 'uiSrc/utils/highlighting'
import { OnboardingTourOptions } from 'uiSrc/components/onboarding-tour'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

interface AnalyticsTabs {
  id: AnalyticsViewTab
  label: string | ReactNode
  onboard?: OnboardingTourOptions
}

const DatabaseAnalyticsTab = () => {
  const { features } = useSelector(appFeatureHighlightingSelector)
  const { recommendations: recommendationsHighlighting } = getHighlightingFeatures(features)

  return (
    <>
      <HighlightedFeature
        title={BUILD_FEATURES.recommendations?.title}
        content={BUILD_FEATURES.recommendations?.content}
        type={BUILD_FEATURES.recommendations?.type}
        isHighlight={BUILD_FEATURES.recommendations && recommendationsHighlighting}
        dotClassName="tab-highlighting-dot"
        wrapperClassName="inner-highlighting-wrapper"
      >
        Database Analysis
      </HighlightedFeature>
    </>
  )
}

export const analyticsViewTabs: AnalyticsTabs[] = [
  {
    id: AnalyticsViewTab.ClusterDetails,
    label: 'Overview',
    onboard: ONBOARDING_FEATURES.ANALYTICS_OVERVIEW
  },
  {
    id: AnalyticsViewTab.DatabaseAnalysis,
    label: <DatabaseAnalyticsTab />,
    onboard: ONBOARDING_FEATURES.ANALYTICS_DATABASE_ANALYSIS
  },
  {
    id: AnalyticsViewTab.SlowLog,
    label: 'Slow Log',
    onboard: ONBOARDING_FEATURES.ANALYTICS_SLOW_LOG
  },
]
