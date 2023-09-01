import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'

export interface Props {
  children: (socialCloudHandlerClick: (e: React.MouseEvent, source: OAuthSocialSource) => void) => React.ReactElement
}

const OAuthSocialHandlerDialog = ({ children }: Props) => {
  const { [FeatureFlags.cloudSso]: feature } = useSelector(appFeatureFlagsFeaturesSelector)

  const dispatch = useDispatch()

  const socialCloudHandlerClick = (e: React.MouseEvent, source: OAuthSocialSource) => {
    const isCloudSsoEnabled = !!feature?.flag

    if (!isCloudSsoEnabled) {
      return
    }
    e?.preventDefault()

    dispatch(setSocialDialogState?.(source))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_CLICKED,
      eventData: { source },
    })
  }

  return children?.(socialCloudHandlerClick)
}

export default OAuthSocialHandlerDialog
