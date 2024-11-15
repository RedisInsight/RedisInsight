import React from 'react'
import { EuiLink, EuiTextColor } from '@elastic/eui'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'

export interface Props {
  path: string
}

const UsePubSubLink = ({ path }: Props) => (
  <FeatureFlagComponent
    name={FeatureFlags.envDependent}
    otherwise={<EuiTextColor data-testid="user-pub-sub-link-disabled" color="accent">PubSub not supported in this environment.</EuiTextColor>}
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
