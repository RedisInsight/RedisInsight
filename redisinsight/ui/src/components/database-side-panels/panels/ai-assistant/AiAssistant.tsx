import React from 'react'
import { useSelector } from 'react-redux'

import { aiAssistantChatSelector } from 'uiSrc/slices/panels/aiAssistant'
import { WelcomeAiAssistant, Chat } from './components'
import styles from './styles.module.scss'

const AiAssistant = () => {
  const { id } = useSelector(aiAssistantChatSelector)

  return (
    <div className={styles.wrapper}>
      {id ? (<Chat />) : (<WelcomeAiAssistant />)}
    </div>
  )
}

export default AiAssistant
