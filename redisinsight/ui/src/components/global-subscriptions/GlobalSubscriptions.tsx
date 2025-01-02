import React from 'react'
import { BulkActionsConfig, FeatureFlagComponent, MonitorConfig, OAuthJobs, PubSubConfig } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import CommonAppSubscription from './CommonAppSubscription'

const GlobalSubscriptions = () => (
  <>
    <CommonAppSubscription />
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
