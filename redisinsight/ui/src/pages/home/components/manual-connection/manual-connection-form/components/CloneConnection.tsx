import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export interface Props {
  id?: string
  setIsCloneMode: (val: boolean) => void
}

const CloneConnection = (props: Props) => {
  const { id, setIsCloneMode } = props

  const handleClickClone = () => {
    setIsCloneMode(true)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_REQUESTED,
      eventData: {
        databaseId: id
      }
    })
  }

  return (
    <>
      <EuiFlexGroup responsive={false} justifyContent="flexEnd" style={{ flexGrow: 0 }}>
        <EuiFlexItem grow={false}>
          <EuiButton
            size="s"
            color="secondary"
            iconType="copy"
            aria-label="Clone database"
            data-testid="clone-db-btn"
            onClick={handleClickClone}
          >
            Clone Connection
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
    </>
  )
}

export default CloneConnection
