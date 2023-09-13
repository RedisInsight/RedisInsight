import React from 'react'
import {
  FeatureFlagComponent,
  OAuthSelectAccountDialog,
  OAuthSelectPlan,
  OAuthSignInDialog,
  OAuthSocialDialog,
} from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

const GlobalDialogs = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthSignInDialog />
      <OAuthSelectAccountDialog />
      <OAuthSelectPlan />
      <OAuthSocialDialog />
    </FeatureFlagComponent>
  </>
)

export default GlobalDialogs
