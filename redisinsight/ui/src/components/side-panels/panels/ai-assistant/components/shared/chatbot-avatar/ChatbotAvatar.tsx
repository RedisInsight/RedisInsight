import { EuiIcon } from '@elastic/eui'
import React from 'react'
import cx from 'classnames'
import LogoSVG from 'uiSrc/assets/img/chatbot_logo.svg?react'
import { BotType } from 'uiSrc/slices/interfaces/aiAssistant'
import styles from './styles.module.scss'

interface Props {
  type?: BotType
}

const ChatbotAvatar = ({ type = BotType.General }: Props) => {
  const color = type === BotType.General ? '#ffffff' : '#091A23'
  return (
    <div
      className={cx(styles.container, styles[type])}
    >
      <EuiIcon aria-label="ai message" type={LogoSVG} color={color} />
    </div>
  )
}

export default ChatbotAvatar
