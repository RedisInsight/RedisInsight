import React, { useEffect } from 'react'
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

import {
  toggleCli,
  resetCliSettings,
  deleteCliClientAction,
} from 'uiSrc/slices/cli/cli-settings'
import { BrowserStorageItem } from 'uiSrc/constants'
import { sessionStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { resetOutputLoading } from 'uiSrc/slices/cli/cli-output'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import styles from './styles.module.scss'

const CliHeader = () => {
  const dispatch = useDispatch()

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const removeCliClient = () => {
    const cliClientUuid = sessionStorageService.get(BrowserStorageItem.cliClientUuid) ?? ''

    cliClientUuid && dispatch(deleteCliClientAction(instanceId, cliClientUuid))
  }

  useEffect(() => {
    window.addEventListener('beforeunload', removeCliClient, false)
    return () => {
      window.removeEventListener('beforeunload', removeCliClient, false)
    }
  }, [])

  const handleCloseCli = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_CLOSED,
      eventData: {
        databaseId: instanceId
      }
    })
    removeCliClient()
    dispatch(resetCliSettings())
    dispatch(resetOutputLoading())
  }

  const handleHideCli = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_MINIMIZED,
      eventData: {
        databaseId: instanceId
      }
    })
    dispatch(toggleCli())
  }

  return (
    <div className={styles.container} id="cli-header">
      <EuiFlexGroup
        justifyContent="spaceBetween"
        gutterSize="none"
        alignItems="center"
        responsive={false}
        style={{ height: '100%' }}
      >
        <EuiFlexItem grow={false} className={styles.title}>
          <EuiIcon type="console" size="m" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_CLI}
            anchorPosition="upLeft"
            panelClassName={styles.cliOnboardPanel}
          >
            <EuiText>CLI</EuiText>
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
              id="hide-cli"
              aria-label="hide cli"
              data-testid="hide-cli"
              className={styles.icon}
              onClick={handleHideCli}
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
              id="close-cli"
              aria-label="close cli"
              data-testid="close-cli"
              className={styles.icon}
              onClick={handleCloseCli}
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default CliHeader
