import React from 'react'
import { EuiLink, EuiTextColor } from '@elastic/eui'
import { FeatureFlags } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'
import FeatureFlagComponent from 'uiSrc/components/feature-flag-component/FeatureFlagComponent'

export interface Props {
  path: string
}

const UsePubSubLink = ({ path }: Props) => (
  <FeatureFlagComponent
    name={FeatureFlags.envDependent}
    otherwise={<div className="cli-output-response-fail" data-testid="user-pub-sub-link-disabled">PubSub not supported in this environment.</div>}
  >
    <EuiTextColor color="danger" key={Date.now()} data-testid="user-pub-sub-link">
      {'Use '}
      <EuiLink {...getRouterLinkProps(path)} color="text" data-test-subj="pubsub-page-btn">
        Pub/Sub
      </EuiLink>
      {' tool to subscribe to channels.'}
    </EuiTextColor>
  </FeatureFlagComponent>
)

export default UsePubSubLink
