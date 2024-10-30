import React from 'react'
import { EuiButtonIcon } from '@elastic/eui'

import RestartIcon from 'uiSrc/assets/img/ai/Restart.svg?react'

import { RestartChat } from 'uiSrc/components/side-panels/panels/ai-assistant/components/ai-chat/components'

import { Nullable } from 'uiSrc/utils'
import { AiAgreement, AiDatabaseAgreement } from 'uiSrc/slices/interfaces/aiAssistant'
import CopilotSettingsPopover from '../copilot-settings-popover'
import styles from './styles.module.scss'

export interface Props {
  databaseId: Nullable<string>
  onRestart: () => void
  generalAgreement: Nullable<AiAgreement>
  databaseAgreement: Nullable<AiDatabaseAgreement>
  settingsOpenedByDefault: boolean
}

const ChatHeader = ({
  databaseId,
  generalAgreement,
  databaseAgreement,
  onRestart,
  settingsOpenedByDefault
}: Props) => (
  <div className={styles.header}>
    <div className={styles.headerActions}>
      <CopilotSettingsPopover
        databaseId={databaseId}
        generalAgreement={generalAgreement}
        databaseAgreement={databaseAgreement}
        onRestart={onRestart}
        settingsOpenedByDefault={settingsOpenedByDefault}
      />

      <RestartChat
        button={(
          <EuiButtonIcon
            size="s"
            iconSize="l"
            iconType={RestartIcon}
            aria-label="restart ai session button"
            data-testid="ai-restart-session-btn"
          />
          )}
        onConfirm={onRestart}
      />
    </div>
  </div>
)

export default ChatHeader
