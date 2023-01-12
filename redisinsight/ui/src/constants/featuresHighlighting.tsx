import React from 'react'
import { PageNames } from 'uiSrc/constants/pages'

export type FeaturesHighlightingType = 'plain' | 'tooltip' | 'popover'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
}
export const BUILD_FEATURES: { [key: string]: BuildHighlightingFeature } = {
  recommendations: {
    type: 'tooltip',
    title: 'Database Recommendations',
    content: 'Run database analysis to get recommendations for optimizing your database.',
    page: PageNames.analytics
  }
}
