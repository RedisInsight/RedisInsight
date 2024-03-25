import React from 'react'
import {
  FeatureFlagComponent,
  OAuthSelectAccountDialog,
  OAuthSelectPlan,
  OAuthSocialDialog,
} from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

const GlobalDialogs = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthSelectAccountDialog />
      <OAuthSelectPlan />
      <OAuthSocialDialog />
    </FeatureFlagComponent>
  </>
)

export default GlobalDialogs
