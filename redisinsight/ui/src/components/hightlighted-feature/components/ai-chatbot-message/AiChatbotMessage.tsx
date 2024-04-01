import React, { useEffect } from 'react'
import { EuiButton, EuiImage, EuiModal, EuiModalBody, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { removeFeatureFromHighlighting } from 'uiSrc/slices/app/features'

import AiRobot from 'uiSrc/assets/img/ai/ai-robot.svg'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import styles from './styles.module.scss'

const AiChatbotMessage = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_MESSAGE_DISPLAYED
    })
  }, [])

  const handleClickShowMe = () => {
    dispatch(changeSelectedTab(InsightsPanelTabs.AiAssistant))
    dispatch(setSelectedTab(AiChatType.Assistance))
    dispatch(toggleInsightsPanel(true))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_MESSAGE_CLICKED
    })
    closeDialog()
  }

  const closeDialog = () => {
    dispatch(removeFeatureFromHighlighting('aiChatbot'))
  }

  return (
    <EuiModal
      className={styles.modal}
      onClose={closeDialog}
    >
      <EuiModalBody>
        <div className={styles.container}>
          <EuiImage src={AiRobot} alt="" />
          <EuiSpacer />
          <EuiTitle size="s"><h4>New! AI is here</h4></EuiTitle>
          <EuiText color="subdued" textAlign="center">
            Ask anything about Redis or search and query Redis data using your natural language.
          </EuiText>
          <EuiSpacer size="l" />
          <EuiButton
            fill
            color="secondary"
            onClick={handleClickShowMe}
            data-testid="ai-chat-message-btn"
          >
            Show me
          </EuiButton>
        </div>
      </EuiModalBody>
    </EuiModal>
  )
}

export default AiChatbotMessage
