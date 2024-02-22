import React from 'react'
import { EuiImage, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import AiRobotImg from 'uiSrc/assets/img/ai/ai-robot.svg'

import { createAssistantChatAction } from 'uiSrc/slices/panels/aiAssistant'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => {
  const dispatch = useDispatch()

  const handleStartChat = () => {
    dispatch(createAssistantChatAction())
  }

  return (
    <div className={styles.wrapper}>
      <EuiTitle><span>Sign in</span></EuiTitle>
      <EuiSpacer size="m" />
      <EuiText color="subdued">
        Inquire about any aspect of Redis that piques your interest, and receive instant answers!
      </EuiText>

      <EuiSpacer size="l" />

      <button onClick={handleStartChat} type="button">
        <EuiImage src={AiRobotImg} alt="ai chat" />
      </button>

    </div>
  )
}

export default WelcomeAiAssistant
