import React from 'react'

export type FeaturesHighlightingType = 'plain' | 'tooltip' | 'popover'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
}
export const BUILD_FEATURES: { [key: string]: BuildHighlightingFeature } = {
  importDatabases: {
    type: 'tooltip',
    title: 'Import Database Connections',
    content: 'Import your database connections from other Redis UIs',
    page: 'settings'
  }
}
