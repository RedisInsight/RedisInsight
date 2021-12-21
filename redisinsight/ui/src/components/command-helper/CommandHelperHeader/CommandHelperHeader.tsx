import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiText,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { cliSettingsSelector, resetCliHelperSettings, toggleCliHelper } from 'uiSrc/slices/cli/cli-settings'

import styles from './styles.module.scss'

const CommandHelperHeader = () => {
  const { isShowHelper } = useSelector(cliSettingsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleExpandHelper = () => {
    sendEventTelemetry({
      event: isShowHelper ? TelemetryEvent.COMMAND_HELPER_COLLAPSED : TelemetryEvent.COMMAND_HELPER_EXPANDED,
      eventData: {
        databaseId: instanceId
      }
    })
    dispatch(resetCliHelperSettings())
  }

  const handleHideHelper = () => {
    dispatch(toggleCliHelper())
  }

  return (
    <div className={styles.container} id="command-helper-header">
      <EuiFlexGroup
        justifyContent="spaceBetween"
        gutterSize="none"
        alignItems="center"
        responsive={false}
        style={{ height: '100%' }}
      >
        <EuiFlexItem grow={false} className={styles.title}>
          <EuiIcon type="documents" size="m" />
          <EuiText>Command Helper</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow />
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Minimize"
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <EuiButtonIcon
              iconType="minus"
              color="primary"
              id="hide-command-helper"
              aria-label="hide command helper"
              data-testid="hide-command-helper"
              className={styles.icon}
              onClick={handleHideHelper}
            />
          </EuiToolTip>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Close"
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              id="close-command-helper"
              aria-label="close command helper"
              data-testid="close-command-helper"
              className={styles.icon}
              onClick={handleExpandHelper}
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default CommandHelperHeader
