import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'

export const getPagesForFeatures = (features: string[] = []) => {
  const result: { [key: string]: string[] } = {}
  features.forEach((f) => {
    if (f in BUILD_FEATURES) {
      const pageName = BUILD_FEATURES[f].page
      if (!pageName) return

      if (result[pageName]) {
        result[pageName] = [...result[pageName], f]
      } else {
        result[pageName] = [f]
      }
    }
  })

  return result
}

export const getHighlightingFeatures = (features: string[]): { [key: string]: boolean } => features
  .reduce((prev, next) => ({ ...prev, [next]: true }), {})
