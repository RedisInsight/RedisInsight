import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  resetCliHelperSettings,
  toggleCliHelper,
  toggleHideCliHelper,
} from 'uiSrc/slices/cli/cli-settings'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { WindowControlGroup } from 'uiSrc/components/base/shared/WindowControlGroup'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

const CommandHelperHeader = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleCloseHelper = () => {
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_CLOSED,
      eventData: {
        databaseId: instanceId,
      },
    })
    dispatch(resetCliHelperSettings())
  }

  const handleHideHelper = () => {
    sendEventTelemetry({
      event: TelemetryEvent.COMMAND_HELPER_MINIMIZED,
      eventData: {
        databaseId: instanceId,
      },
    })
    dispatch(toggleCliHelper())
    dispatch(toggleHideCliHelper())
  }

  return (
    <div className={styles.container} id="command-helper-header">
      <Row justify="between" align="center" style={{ height: '100%' }}>
        <FlexItem className={styles.title}>
          <RiIcon type="DocumentationIcon" size="L" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_COMMAND_HELPER}
            anchorPosition="upLeft"
            panelClassName={styles.helperOnboardPanel}
          >
            <Text>Command Helper</Text>
          </OnboardingTour>
        </FlexItem>
        <FlexItem grow />
        <WindowControlGroup
          onClose={handleCloseHelper}
          onHide={handleHideHelper}
          id="command-helper"
          label="Command Helper"
        />
      </Row>
    </div>
  )
}

export default CommandHelperHeader
