import React from 'react'
import { EuiButton, EuiButtonIcon } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import CopilotPreview from 'uiSrc/components/side-panels/components/copilot-panel/components/copilot-preview'
import { setHideCopilotSplashScreen } from 'uiSrc/slices/panels/aiAssistant'
import { ExternalLink } from 'uiSrc/components/base'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
}

const CopilotSplashScreen = ({ onClose }: Props) => {
  const dispatch = useDispatch()

  const onStartCopilot = () => {
    dispatch(setHideCopilotSplashScreen(true))
  }

  return (
    <div className={styles.container}>
      <div className={styles.closeBtnWrapper}>
        <div className={styles.titleWrapper}>
          <span className={styles.title}>Redis Copilot</span>
        </div>
        <EuiButtonIcon
          iconSize="m"
          iconType="cross"
          color="primary"
          aria-label="close copilot splashscreen"
          onClick={onClose}
          data-testid="close-copilot-splashscreen-btn"
        />
      </div>
      <div className={styles.contentWrapper} data-testid="copilot-splashscreen">
        <div className={styles.copilotPreviewWrapper}>
          <CopilotPreview />
        </div>
        <div className={styles.actionBtnWrapper}>
          <ExternalLink
            iconPosition="right"
            href={getUtmExternalLink(EXTERNAL_LINKS.copilotMoreInfo, {
              medium: UTM_MEDIUMS.Main,
              campaign: UTM_CAMPAINGS.Copilot,
            })}
          >More Info
          </ExternalLink>
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
