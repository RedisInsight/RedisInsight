import React from 'react'
import {
  FeatureFlagComponent,
  OAuthSelectAccountDialog,
  OAuthSelectPlan,
  OAuthSignInDialog,
} from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

const GlobalDialogs = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthSignInDialog />
      <OAuthSelectAccountDialog />
      <OAuthSelectPlan />
    </FeatureFlagComponent>
  </>
)

export default GlobalDialogs
