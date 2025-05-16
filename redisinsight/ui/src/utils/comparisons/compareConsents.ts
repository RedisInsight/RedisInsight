import { has } from 'lodash'
import { isVersionHigher } from 'uiSrc/utils/comparisons/compareVersions'
import { defaultConfig } from 'uiSrc/config/default'

// returns true if has different consents
export const isDifferentConsentsExists = (specs: any, applied: any) => {
  // If terms and conditions are accepted via environment variable, always return false
  if (defaultConfig.app.acceptTermsAndConditions) {
    return false
  }
  return !!compareConsents(specs, applied).length
}

export const compareConsents = (
  specs: any = {},
  applied: any = {},
  isReturnAllNonRequired: boolean = false,
): any[] => {
  if (!specs) {
    return []
  }
  return Object.keys(specs)
    .filter(
      (consent) =>
        (isReturnAllNonRequired && !specs[consent]?.required) ||
        applied === null ||
        !has(applied, consent) ||
        isVersionHigher(specs[consent]?.since, applied.version),
    )
    .map((consent) => ({ ...specs[consent], agreementName: consent }))
}
