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
  [PageNames.triggeredFunctions]: {
    type: 'tooltip',
    title: 'Triggers & Functions',
    content: 'Triggers and Functions can execute server-side functions triggered by events or data operations to decrease latency and react in real time to database events.',
    page: PageNames.triggeredFunctions,
    asPageFeature: true
  }
} as const
