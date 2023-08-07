import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTextColor } from '@elastic/eui'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { removeCapiKeyAction } from 'uiSrc/slices/oauth/cloud'
import { Pages } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export interface Props {
  resourceId: string
  text: string | JSX.Element | JSX.Element[]
  onClose?: () => void
}

const CloudCapiUnAuthorizedErrorContent = (
  {
    text,
    onClose = () => {},
    resourceId,
  }: Props
) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const handleRemoveCapi = () => {
    dispatch(removeCapiKeyAction({ id: resourceId, name: 'Api Key' }, () => {
      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
        eventData: {
          source: OAuthSocialSource.ConfirmationMessage
        }
      })
    }))
    onClose?.()
  }

  const handleGoToSettings = () => {
    history.push(`${Pages.settings}#cloud`)
    onClose?.()
  }

  return (
    <>
      <EuiTextColor color="ghost">{text}</EuiTextColor>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            size="s"
            color="warning"
            onClick={handleGoToSettings}
            className="toast-danger-btn euiBorderWidthThick"
            data-testid="go-to-settings-btn"
          >
            Go to Settings
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            size="s"
            color="warning"
            onClick={handleRemoveCapi}
            className="toast-danger-btn"
            data-testid="remove-api-key-btn"
          >
            Remove API key
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default CloudCapiUnAuthorizedErrorContent
