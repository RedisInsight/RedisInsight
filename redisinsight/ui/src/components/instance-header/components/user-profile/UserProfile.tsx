import React from 'react'
import { useSelector } from 'react-redux'
import { EuiFlexItem } from '@elastic/eui'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthUserProfile } from 'uiSrc/components'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { CloudUserProfile } from './CloudUserProfile'

const UserProfile = () => {
  const {
    [FeatureFlags.envDependent]: envDependentFeature,
    [FeatureFlags.cloudAds]: cloudAds,
    [FeatureFlags.cloudSso]: cloudSso,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  if (!envDependentFeature?.flag) {
    return (
      <EuiFlexItem grow={false} style={{ marginLeft: 16 }}>
        <CloudUserProfile />
      </EuiFlexItem>
    )
  }

  if (cloudAds?.flag && cloudSso?.flag) {
    return (
      <EuiFlexItem grow={false} style={{ marginLeft: 16 }}>
        <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
      </EuiFlexItem>
    )
  }

  return null
}

export default UserProfile
