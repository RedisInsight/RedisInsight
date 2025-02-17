import { EuiIcon } from '@elastic/eui'
import React from 'react'
import cx from 'classnames'
import LogoSVG from 'uiSrc/assets/img/chatbot_logo.svg?react'
import { AiTool } from 'uiSrc/slices/interfaces/aiAssistant'
import styles from './styles.module.scss'

interface Props {
  type?: AiTool
}

const ChatbotAvatar = ({ type = AiTool.General }: Props) => {
  const color = type === AiTool.General ? '#ffffff' : '#091A23'
  return (
    <div
      className={cx(styles.container, styles[type.toLowerCase()])}
    >
      <EuiIcon aria-label="ai message" type={LogoSVG} color={color} />
    </div>
  )
}

export default ChatbotAvatar
