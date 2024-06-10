import React, { useEffect } from 'react'
import { EuiButton, EuiImage, EuiModal, EuiModalBody, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { removeFeatureFromHighlighting } from 'uiSrc/slices/app/features'

import AiRobot from 'uiSrc/assets/img/ai/ai-robot.svg'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { changeSidePanel } from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
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
    dispatch(setSelectedTab(AiChatType.Assistance))
    dispatch(changeSidePanel(SidePanels.AiAssistant))

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
          <EuiTitle size="s"><h4>Introducing Redis Copilot!</h4></EuiTitle>
          <EuiText color="subdued" textAlign="center">
            Your new AI-powered companion that lets you learn about Redis and explore your data,
            in a conversational manner, while also providing context-aware assistance to build search queries.
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
