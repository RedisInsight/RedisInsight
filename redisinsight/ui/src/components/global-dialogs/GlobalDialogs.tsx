import React from 'react'
import { FeatureFlagComponent, OAuthSelectAccountDialog, OAuthSignInDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

const GlobalDialogs = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthSignInDialog />
      <OAuthSelectAccountDialog />
    </FeatureFlagComponent>
  </>
)

export default GlobalDialogs
