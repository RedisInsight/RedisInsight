import React, { ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import { appFeaturesToHighlightSelector, removeFeatureFromHighlighting } from 'uiSrc/slices/app/features-highlighting'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'

import Recommendations from '../recommendations-view'
import AnalysisDataView from '../analysis-data-view'

interface DatabaseAnalysisTabs {
  id: DatabaseAnalysisViewTab,
  name: (count?: number) => string | ReactNode,
  content: ReactNode
}

const RecommendationsTab = ({ count }: { count?: number }) => {
  const { recommendations: recommendationsHighlighting } = useSelector(appFeaturesToHighlightSelector) ?? {}

  const dispatch = useDispatch()

  return count ? (
    <>
      <HighlightedFeature
        type="plain"
        isHighlight={BUILD_FEATURES.recommendations && recommendationsHighlighting}
        onClick={() => dispatch(removeFeatureFromHighlighting('recommendations'))}
        dotClassName="tab-highlighting-dot"
      >
        <>Recommendations ({count})</>
      </HighlightedFeature>
    </>
  ) : (<>Recommendations</>)
}

export const databaseAnalysisTabs: DatabaseAnalysisTabs[] = [
  {
    id: DatabaseAnalysisViewTab.DataSummary,
    name: () => 'Data Summary',
    content: <AnalysisDataView />
  },
  {
    id: DatabaseAnalysisViewTab.Recommendations,
    name: (count) => <RecommendationsTab count={count} />,
    content: <Recommendations />
  },
]
