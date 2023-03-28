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
  myTutorials: {
    type: 'tooltip',
    title: 'Upload your own tutorials',
    content: 'Upload tutorials to work in Workbench and share them with others.',
    page: PageNames.workbench
  }
}
