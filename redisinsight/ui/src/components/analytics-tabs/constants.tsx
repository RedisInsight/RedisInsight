import React, { ReactNode } from 'react'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { useSelector } from 'react-redux'
import { appFeaturesToHighlightSelector } from 'uiSrc/slices/app/features-highlighting'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'

interface AnalyticsTabs {
  id: AnalyticsViewTab
  label: string | ReactNode
}

const DatabaseAnalyticsTab = () => {
  const { recommendations: recommendationsHighlighting } = useSelector(appFeaturesToHighlightSelector) ?? {}

  return (
    <>
      <HighlightedFeature
        title={BUILD_FEATURES.recommendations?.title}
        content={BUILD_FEATURES.recommendations?.content}
        type={BUILD_FEATURES.recommendations?.type}
        isHighlight={BUILD_FEATURES.recommendations && recommendationsHighlighting}
        dotClassName="tab-highlighting-dot"
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
  },
  {
    id: AnalyticsViewTab.DatabaseAnalysis,
    label: <DatabaseAnalyticsTab />,
  },
  {
    id: AnalyticsViewTab.SlowLog,
    label: 'Slow Log',
  },
]
