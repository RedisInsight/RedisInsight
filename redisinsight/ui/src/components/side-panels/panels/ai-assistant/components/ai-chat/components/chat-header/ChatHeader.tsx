import React from 'react'
import { EuiButtonIcon } from '@elastic/eui'

import RestartIcon from 'uiSrc/assets/img/ai/Restart.svg?react'

import { RestartChat } from 'uiSrc/components/side-panels/panels/ai-assistant/components/ai-chat/components'

import { Nullable } from 'uiSrc/utils'
import { AiAgreement } from 'uiSrc/slices/interfaces/aiAssistant'
import CopilotSettingsPopover from '../copilot-settings-popover'
import styles from './styles.module.scss'

export interface Props {
  databaseId: Nullable<string>
  onRestart: () => void
  agreements: Nullable<AiAgreement[]>
}

const ChatHeader = (props: Props) => {
  const { databaseId, agreements, onRestart } = props

  return (
    <div className={styles.header}>
      <div className={styles.headerActions}>

        <CopilotSettingsPopover databaseId={databaseId} agreements={agreements} onRestart={onRestart} />

        <RestartChat
          button={(
            <EuiButtonIcon
              aria-label="restart ai session button"
              iconType={RestartIcon}
              iconSize="l"
              size="s"
              data-testid="ai-restart-session-btn"
            />
          )}
          onConfirm={onRestart}
        />
      </div>
    </div>
  )
}

export default ChatHeader
