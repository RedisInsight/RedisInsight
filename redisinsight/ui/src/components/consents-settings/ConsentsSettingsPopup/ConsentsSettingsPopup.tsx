import React, { useContext, useEffect } from 'react'
import {
  EuiOverlayMask,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
} from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Pages, Theme } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import darkLogo from 'uiSrc/assets/img/dark_logo.svg'
import lightLogo from 'uiSrc/assets/img/light_logo.svg'

import styles from '../styles.module.scss'

const ConsentsSettingsPopup = () => {
  const history = useHistory()
  const { server } = useSelector(appInfoSelector)
  const { theme } = useContext(ThemeContext)

  const handleSubmitted = () => {
    if (server && server.buildType === BuildType.RedisStack && server?.fixedDatabaseId) {
      history.push(Pages.browser(server?.fixedDatabaseId))
    }
  }

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CONSENT_MENU_VIEWED
    })
  }, [])

  return (
    <EuiOverlayMask>
      <EuiModal className={styles.consentsPopup} onClose={() => {}} data-testid="consents-settings-popup">
        <EuiModalHeader className={styles.modalHeader}>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiTitle size="s">
                <h3 className={styles.consentsPopupTitle}>EULA and Privacy Settings</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiIcon
                className={styles.redisIcon}
                size="original"
                type={theme === Theme.Dark ? darkLogo : lightLogo}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalHeader>
        <EuiModalBody>
          <ConsentsSettings onSubmitted={handleSubmitted} />
        </EuiModalBody>
      </EuiModal>
    </EuiOverlayMask>
  )
}

export default ConsentsSettingsPopup
