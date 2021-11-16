import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { toggleCli, clearSearchingCommand } from 'uiSrc/slices/cli/cli-settings'

import styles from '../cli-header/styles.module.scss'

const CliHeaderMinimized = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleExpandCli = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_OPENED,
      eventData: {
        databaseId: instanceId
      }
    })
    dispatch(toggleCli())
    dispatch(clearSearchingCommand())
  }

  return (
    <div className={styles.containerMinimized} onClick={handleExpandCli}>
      <EuiFlexGroup
        justifyContent="spaceBetween"
        gutterSize="none"
        alignItems="center"
        data-testid="expand-cli"
        responsive={false}
        style={{ height: '100%', cursor: 'pointer' }}
      >
        <EuiFlexItem grow={false}>
          <EuiText>CLI</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow />
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Open CLI"
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <EuiButtonIcon
              iconType="expand"
              color="subdued"
              aria-label="expand cli"
              onClick={() => {}}
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default CliHeaderMinimized
