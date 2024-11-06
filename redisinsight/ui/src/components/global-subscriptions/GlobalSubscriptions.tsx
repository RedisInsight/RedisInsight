import React from 'react'
import {
  MonitorConfig,
  PubSubConfig,
  BulkActionsConfig,
  FeatureFlagComponent,
  OAuthJobs,
} from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import CommonAppSubscription from './CommonAppSubscription'

const GlobalSubscriptions = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
      <CommonAppSubscription />
    </FeatureFlagComponent>
    <MonitorConfig />
    <PubSubConfig />
    <FeatureFlagComponent name={FeatureFlags.envDependent}>
      <BulkActionsConfig />
    </FeatureFlagComponent>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthJobs />
    </FeatureFlagComponent>
  </>
)

export default GlobalSubscriptions
