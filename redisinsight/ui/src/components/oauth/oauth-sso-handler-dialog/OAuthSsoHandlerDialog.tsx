import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { setSignInDialogState } from 'uiSrc/slices/oauth/cloud'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { Maybe } from 'uiSrc/utils'

export interface Props {
  children: (
    ssoCloudHandlerClick: (
      e: React.MouseEvent,
      { source, action }: { source: OAuthSocialSource, action?: Maybe<OAuthSocialAction> },
      telemetrySource?: string
    ) => void,
    isSSOEnabled: boolean,
  ) => React.ReactElement
}

const OAuthSsoHandlerDialog = ({ children }: Props) => {
  const { [FeatureFlags.cloudSso]: feature } = useSelector(appFeatureFlagsFeaturesSelector)

  const dispatch = useDispatch()

  const ssoCloudHandlerClick = (
    e: React.MouseEvent,
    { source, action }: { source: OAuthSocialSource, action?: Maybe<OAuthSocialAction> },
    telemetrySource?: string
  ) => {
    const isCloudSsoEnabled = !!feature?.flag

    if (!isCloudSsoEnabled) {
      return
    }
    e?.preventDefault()

    dispatch(setSignInDialogState?.(source))
    dispatch(setSSOFlow?.(action))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: { source: telemetrySource || source },
    })
  }

  return children?.(ssoCloudHandlerClick, !!feature?.flag)
}

export default OAuthSsoHandlerDialog
