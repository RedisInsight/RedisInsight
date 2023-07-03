import { useDispatch, useSelector } from 'react-redux'
import React, { useCallback, useEffect } from 'react'
import { oauthCloudAccountSelector, setSignInDialogState } from 'uiSrc/slices/oauth/cloud'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export interface Props {
  children: (ssoCloudHandlerClick: (e: React.MouseEvent, source: SignInDialogSource) => void) => React.ReactElement
}

const OAuthSsoHandlerDialog = ({ children }: Props) => {
  // const { [FeatureFlags.cloudSso]: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const { cloudSso: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const { id = '' } = useSelector(oauthCloudAccountSelector) ?? {}

  useEffect(() => {
    console.log('useEffect', { id })
  }, [id])

  const dispatch = useDispatch()

  console.log({ id })

  const ssoCloudHandlerClick = (e: React.MouseEvent, source: SignInDialogSource) => {
  // const ssoCloudHandlerClick = useCallback(async (e: React.MouseEvent, source: SignInDialogSource) => {
    console.log('ssoCloudHandlerClick', { feature, id })

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

    sendEventTelemetry?.({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: { source },
    })
  }
  // }, [id, feature])

  return children?.(ssoCloudHandlerClick)
}

export default OAuthSsoHandlerDialog
