import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { oauthCloudCurrentAccountSelector, setSignInDialogState } from 'uiSrc/slices/oauth/cloud'

export interface Props {
  children: (ssoCloudHandlerClick: (e: React.MouseEvent, source: SignInDialogSource) => void) => React.ReactElement
}

const OAuthSsoHandlerDialog = ({ children }: Props) => {
  const { [FeatureFlags.cloudSso]: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const { id = '' } = useSelector(oauthCloudCurrentAccountSelector) ?? {}

  const dispatch = useDispatch()

  const ssoCloudHandlerClick = (e: React.MouseEvent, source: SignInDialogSource) => {
    const isCloudSsoEnabled = !!feature?.flag

    if (!isCloudSsoEnabled) {
      return
    }
    e?.preventDefault()

    const isSignedIn = !!id

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
