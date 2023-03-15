import React from 'react'
import { useDispatch } from 'react-redux'
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
import { resetCliHelperSettings, toggleCliHelper, toggleHideCliHelper } from 'uiSrc/slices/cli/cli-settings'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import styles from './styles.module.scss'

const CommandHelperHeader = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleCloseHelper = () => {
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_CLOSED,
      eventData: {
        databaseId: instanceId
      }
    })
    dispatch(resetCliHelperSettings())
  }

  const handleHideHelper = () => {
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_MINIMIZED,
      eventData: {
        databaseId: instanceId
      }
    })
    dispatch(toggleCliHelper())
    dispatch(toggleHideCliHelper())
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
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_COMMAND_HELPER}
            anchorPosition="upLeft"
            panelClassName={styles.helperOnboardPanel}
          >
            <EuiText>Command Helper</EuiText>
          </OnboardingTour>
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
              onClick={handleCloseHelper}
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default CommandHelperHeader
