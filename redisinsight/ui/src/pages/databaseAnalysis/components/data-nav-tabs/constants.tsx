import React, { ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import {
  appFeatureHighlightingSelector,
  removeFeatureFromHighlighting
} from 'uiSrc/slices/app/features'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'

import { getHighlightingFeatures } from 'uiSrc/utils/highlighting'
import { OnboardingTourOptions } from 'uiSrc/components/onboarding-tour'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import Recommendations from '../recommendations-view'
import AnalysisDataView from '../analysis-data-view'

interface DatabaseAnalysisTabs {
  id: DatabaseAnalysisViewTab,
  name: (count?: number) => string | ReactNode,
  content: ReactNode,
  onboard?: OnboardingTourOptions
}

const RecommendationsTab = ({ count }: { count?: number }) => {
  const { features } = useSelector(appFeatureHighlightingSelector)
  const { recommendations: recommendationsHighlighting } = getHighlightingFeatures(features)

  const dispatch = useDispatch()

  return (
    <HighlightedFeature
      type="plain"
      isHighlight={BUILD_FEATURES.recommendations && recommendationsHighlighting}
      onClick={() => dispatch(removeFeatureFromHighlighting('recommendations'))}
      dotClassName="tab-highlighting-dot"
      wrapperClassName="inner-highlighting-wrapper"
    >
      {count ? <>Recommendations ({count})</> : <>Recommendations</>}
    </HighlightedFeature>
  )
}

export const databaseAnalysisTabs: DatabaseAnalysisTabs[] = [
  {
    id: DatabaseAnalysisViewTab.DataSummary,
    name: () => 'Data Summary',
    content: <AnalysisDataView />,
  },
  {
    id: DatabaseAnalysisViewTab.Recommendations,
    name: (count) => <RecommendationsTab count={count} />,
    content: <Recommendations />,
    onboard: ONBOARDING_FEATURES.ANALYTICS_RECOMMENDATIONS
  },
]
