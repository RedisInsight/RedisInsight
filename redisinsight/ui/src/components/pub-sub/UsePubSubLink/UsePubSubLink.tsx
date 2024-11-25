import React from 'react'
import { EuiLink, EuiTextColor } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { getRouterLinkProps } from 'uiSrc/services'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export interface Props {
  path: string;
}

const UsePubSubLink = ({ path }: Props) => {
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(appFeatureFlagsFeaturesSelector)
  if (envDependentFeature?.flag === false) {
    return (
      <div className="cli-output-response-fail" data-testid="user-pub-sub-link-disabled">PubSub not supported
        in this environment.
      </div>
    )
  }
  return (
    <EuiTextColor color="danger" key={Date.now()} data-testid="user-pub-sub-link">
      {'Use '}
      <EuiLink {...getRouterLinkProps(path)} color="text" data-test-subj="pubsub-page-btn">
        Pub/Sub
      </EuiLink>
      {' tool to subscribe to channels.'}
    </EuiTextColor>
  )
}

export default UsePubSubLink
