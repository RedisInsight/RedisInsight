import React from 'react'

export type FeaturesHighlightingType = 'plain' | 'tooltip' | 'popover'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
}

export const BUILD_FEATURES: Record<string, BuildHighlightingFeature> = {
  bulkUpload: {
    type: 'tooltip',
    title: (<span><i>New:</i> Bulk Upload</span>),
    content: 'Upload your data in bulk from a file.',
  }
} as const
