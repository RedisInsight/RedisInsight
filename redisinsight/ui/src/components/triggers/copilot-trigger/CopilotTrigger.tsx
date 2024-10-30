import React from 'react'
import cx from 'classnames'
import { EuiButton, EuiToolTip } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { sidePanelsSelector, toggleSidePanel } from 'uiSrc/slices/panels/sidePanels'

import CopilotIcon from 'uiSrc/assets/img/icons/copilot.svg?react'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { aiAssistantSelector } from 'uiSrc/slices/panels/aiAssistant'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import styles from './styles.module.scss'

const CopilotTrigger = () => {
  const { openedPanel } = useSelector(sidePanelsSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const { hideCopilotSplashScreen } = useSelector(aiAssistantSelector)

  const dispatch = useDispatch()

  const handleClickTrigger = () => {
    dispatch(toggleSidePanel(SidePanels.AiAssistant))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        action: openedPanel === SidePanels.AiAssistant ? 'close' : 'open',
        authenticated: !!userOAuthProfile?.id,
        firstUse: !hideCopilotSplashScreen
      }
    })
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.isOpen]: openedPanel === SidePanels.AiAssistant
      })}
    >
      <EuiToolTip
        content="Redis Copilot"
      >
        <EuiButton
          fill
          size="s"
          color="secondary"
          className={styles.btn}
          role="button"
          iconType={CopilotIcon}
          onClick={handleClickTrigger}
          data-testid="copilot-trigger"
        />
      </EuiToolTip>
    </div>
  )
}

export default CopilotTrigger
