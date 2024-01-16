import React, { ReactNode } from 'react'

import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
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

export const databaseAnalysisTabs: DatabaseAnalysisTabs[] = [
  {
    id: DatabaseAnalysisViewTab.DataSummary,
    name: () => 'Data Summary',
    content: <AnalysisDataView />,
  },
  {
    id: DatabaseAnalysisViewTab.Recommendations,
    name: (count?: number) => (count ? `Tips (${count})` : 'Tips'),
    content: <Recommendations />,
    onboard: ONBOARDING_FEATURES?.ANALYTICS_RECOMMENDATIONS
  },
]
