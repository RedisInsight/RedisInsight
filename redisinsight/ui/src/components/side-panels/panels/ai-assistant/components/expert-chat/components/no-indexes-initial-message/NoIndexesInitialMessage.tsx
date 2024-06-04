import React, { useEffect } from 'react'
import { EuiLink, EuiSpacer, EuiText } from '@elastic/eui'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import LoadSampleData from 'uiSrc/pages/browser/components/load-sample-data'
import styles from './styles.module.scss'

export interface Props {
  onSuccess?: () => void
  onClickTutorial: () => void
}

const NoIndexesInitialMessage = (props: Props) => {
  const { onSuccess, onClickTutorial } = props

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_NO_INDEXES_MESSAGE_DISPLAYED
    })
  }, [])

  return (
    <div data-testid="no-indexes-chat-message">
      <EuiText size="xs">Hi!</EuiText>
      <EuiText size="xs">I am here to help you get started with data querying. I noticed that you have no indexes created.</EuiText>
      <EuiSpacer />
      <EuiText size="xs">Would you like to load the sample data and indexes (from this
        {' '}
        <EuiLink
          color="subdued"
          external={false}
          className="defaultLink"
          onClick={onClickTutorial}
          data-testid="tutorial-initial-message-link"
        >
          tutorial
        </EuiLink>
        ) to see what Redis Copilot can help you do?
      </EuiText>
      <EuiSpacer />
      <LoadSampleData anchorClassName={styles.anchorClassName} onSuccess={onSuccess} />
      <EuiSpacer />
    </div>
  )
}

export default NoIndexesInitialMessage
