import React from 'react'
import { EuiButton, EuiButtonIcon, EuiTitle } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import CopilotPreview from 'uiSrc/components/side-panels/components/copilot-panel/components/copilot-preview'
import { setHideCopilotSplashScreen } from 'uiSrc/slices/panels/aiAssistant'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
}

const CopilotSplashScreen = ({ onClose }: Props) => {
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const dispatch = useDispatch()

  const onStartCopilot = () => {
    dispatch(setHideCopilotSplashScreen(true))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        action: 'open',
        authenticated: !!userOAuthProfile?.id,
        firstUse: true
      }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.closeBtnWrapper}>
        <EuiButtonIcon
          iconSize="m"
          iconType="cross"
          color="primary"
          aria-label="close copilot splashscreen"
          onClick={onClose}
          data-testid="close-copilot-splashscreen-btn"
        />
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <EuiTitle size="s">
            <span>Redis Copilot</span>
          </EuiTitle>
        </div>
        <div className={styles.copilotPreviewWrapper}>
          <CopilotPreview />
        </div>
        <div className={styles.actionBtnWrapper}>
          <EuiButton
            aria-label="Get started with Copilot"
            onClick={onStartCopilot}
            className={styles.getStartedBtn}
            fill
            color="secondary"
            size="m"
            data-testid="copilot-get-started-btn"
          >
            Get Started
          </EuiButton>
        </div>
      </div>
    </div>
  )
}

export default CopilotSplashScreen
