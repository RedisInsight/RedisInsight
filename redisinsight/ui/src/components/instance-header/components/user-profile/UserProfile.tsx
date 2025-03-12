import React from 'react'
import { useSelector } from 'react-redux'
import { EuiFlexItem } from '@elastic/eui'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { CloudUserProfile } from './CloudUserProfile'
import CloudAd from 'uiSrc/components/cloud-ad/CloudAd'

const UserProfile = () => {
  const {
    [FeatureFlags.envDependent]: envDependentFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  if (!envDependentFeature?.flag) {
    return (
      <EuiFlexItem grow={false} style={{ marginLeft: 16 }}>
        <CloudUserProfile />
      </EuiFlexItem>
    )
  }

  return (
    <CloudAd>
      <FeatureFlagComponent name={FeatureFlags.cloudSso}>
        <EuiFlexItem grow={false} style={{ marginLeft: 16 }}>
          <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
        </EuiFlexItem>
      </FeatureFlagComponent>
    </CloudAd>
  )
}

export default UserProfile
