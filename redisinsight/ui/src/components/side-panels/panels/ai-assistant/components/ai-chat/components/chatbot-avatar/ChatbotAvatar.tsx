import { EuiIcon } from '@elastic/eui'
import React from 'react'
import cx from 'classnames'
import LogoSVG from 'uiSrc/assets/img/chatbot_logo.svg?react'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import styles from './styles.module.scss'

interface Props {
  type?: AiChatType
}

const ChatbotAvatar = ({ type = AiChatType.General }: Props) => {
  const color = type === AiChatType.General ? '#ffffff' : '#091A23'
  return (
    <div
      className={cx(styles.container, styles[type])}
    >
      <EuiIcon aria-label="ai message" type={LogoSVG} color={color} />
    </div>
  )
}

export default ChatbotAvatar
