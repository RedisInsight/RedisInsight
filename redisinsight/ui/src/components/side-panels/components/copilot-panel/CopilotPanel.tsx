import React from 'react'
import { EuiBadge } from '@elastic/eui'
import { Header } from 'uiSrc/components/side-panels/components'
import styles from 'uiSrc/components/side-panels/styles.module.scss'
import AiAssistant from 'uiSrc/components/side-panels/panels/ai-assistant'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onClose: () => void
}

const CopilotPanel = (props: Props) => {
  const { isFullScreen, onToggleFullScreen, onClose } = props

  return (
    <>
      <Header
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
        panelName="copilot"
      >
        <div className={styles.assistantHeader}>
          <span className={styles.tabName}>Redis Copilot</span>
          <EuiBadge className={styles.betaLabel}>BETA</EuiBadge>
        </div>
      </Header>
      <div className={styles.body}>
        <AiAssistant />
      </div>
    </>
  )
}

export default CopilotPanel
