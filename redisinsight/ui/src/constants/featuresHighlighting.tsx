import React from 'react'

export type FeaturesHighlightingType = 'plain' | 'tooltip' | 'popover'

interface BuildHighlightingFeature {
  type: FeaturesHighlightingType
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  page?: string
}
export const BUILD_FEATURES: { [key: string]: BuildHighlightingFeature } = {

}
