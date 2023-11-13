import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { setSignInDialogState } from 'uiSrc/slices/oauth/cloud'

export interface Props {
  children: (
    ssoCloudHandlerClick: (e: React.MouseEvent, source: OAuthSocialSource, telemetrySource?: string) => void,
    isSSOEnabled: boolean,
  ) => React.ReactElement
}

const OAuthSsoHandlerDialog = ({ children }: Props) => {
  const { [FeatureFlags.cloudSso]: feature } = useSelector(appFeatureFlagsFeaturesSelector)

  const dispatch = useDispatch()

  const ssoCloudHandlerClick = (e: React.MouseEvent, source: OAuthSocialSource, telemetrySource?: string) => {
    const isCloudSsoEnabled = !!feature?.flag

    if (!isCloudSsoEnabled) {
      return
    }
    e?.preventDefault()

    dispatch(setSignInDialogState?.(source))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: { source: telemetrySource || source },
    })
  }

  return children?.(ssoCloudHandlerClick, !!feature?.flag)
}

export default OAuthSsoHandlerDialog
