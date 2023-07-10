import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { oauthCloudUserDataSelector, setSignInDialogState } from 'uiSrc/slices/oauth/cloud'

export interface Props {
  children: (ssoCloudHandlerClick: (e: React.MouseEvent, source: OAuthSocialSource) => void) => React.ReactElement
}

const OAuthSsoHandlerDialog = ({ children }: Props) => {
  const { [FeatureFlags.cloudSso]: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const user = useSelector(oauthCloudUserDataSelector)

  const dispatch = useDispatch()

  const ssoCloudHandlerClick = (e: React.MouseEvent, source: OAuthSocialSource) => {
    const isCloudSsoEnabled = !!feature?.flag

    if (!isCloudSsoEnabled) {
      return
    }
    e?.preventDefault()

    const isSignedIn = !!user

    if (isSignedIn) {
      return
    }

    dispatch(setSignInDialogState?.(source))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: { source },
    })
  }

  return children?.(ssoCloudHandlerClick)
}

export default OAuthSsoHandlerDialog
