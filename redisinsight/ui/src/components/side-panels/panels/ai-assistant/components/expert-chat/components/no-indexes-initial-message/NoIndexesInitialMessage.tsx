import React, { useEffect } from 'react'
import { EuiSpacer, EuiText } from '@elastic/eui'
import LoadSampleData from 'uiSrc/pages/browser/components/load-sample-data'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

export interface Props {
  onSuccess?: () => void
}

const NoIndexesInitialMessage = (props: Props) => {
  const { onSuccess } = props

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_NO_INDEXES_MESSAGE_DISPLAYED
    })
  }, [])

  return (
    <div data-testid="no-indexes-chat-message">
      <EuiText size="xs">Hi!</EuiText>
      <EuiText size="xs">I am here to help you get started with data querying.</EuiText>
      <EuiText size="xs">I noticed that you have no indexes created.</EuiText>
      <EuiSpacer />
      <EuiText size="xs">Would you like to load the sample data to see what Redis Copilot can help you do?</EuiText>
      <EuiSpacer />
      <LoadSampleData anchorClassName={styles.anchorClassName} onSuccess={onSuccess} />
      <EuiSpacer size="xs" />
    </div>
  )
}

export default NoIndexesInitialMessage
