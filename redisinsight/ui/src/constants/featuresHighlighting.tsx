import React from 'react'

export type FeaturesHighlightingType = 'plain' | 'tooltip' | 'popover'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
}

export const BUILD_FEATURES: Record<string, BuildHighlightingFeature> = {
  liveRecommendations: {
    type: 'tooltip',
    title: 'Insights for your database',
    content: 'Optimize performance and memory usage, enhance the security of your Redis or Redis Stack database with our Insights!',
  }
} as const
