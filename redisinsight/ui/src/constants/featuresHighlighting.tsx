import React from 'react'
import { PageNames } from 'uiSrc/constants/pages'

export type FeaturesHighlightingType = 'plain' | 'tooltip' | 'popover'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
  asPageFeature?: boolean
}

export const BUILD_FEATURES: Record<string, BuildHighlightingFeature> = {
  insights: {
    type: 'tooltip',
    title: 'Try Redis Tutorials',
    content: 'Try our interactive Tutorials to learn how Redis can solve your use cases.',
  }
} as const
