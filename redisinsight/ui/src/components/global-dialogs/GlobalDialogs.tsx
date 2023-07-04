import React from 'react'
import { FeatureFlagComponent, OAuthSignInDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

const GlobalDialogs = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthSignInDialog />
    </FeatureFlagComponent>
  </>
)

export default GlobalDialogs
