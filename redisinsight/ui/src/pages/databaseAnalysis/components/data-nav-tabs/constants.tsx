import React, { ReactNode } from 'react'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import AnalysisDataView from '../analysis-data-view'
import Recommendations from '../recommendations-view'

interface DatabaseAnalysisTabs {
  id: DatabaseAnalysisViewTab,
  name: (count?: number) => string,
  content: ReactNode
}

export const databaseAnalysisTabs: DatabaseAnalysisTabs[] = [
  {
    id: DatabaseAnalysisViewTab.DataSummary,
    name: () => 'Data Summary',
    content: <AnalysisDataView />
  },
  {
    id: DatabaseAnalysisViewTab.Recommendations,
    name: (count?: number) => (count ? `Recommendations (${count})` : 'Recommendations'),
    content: <Recommendations />
  },
]
