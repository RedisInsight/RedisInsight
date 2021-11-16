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
  EuiSpacer,
  EuiText,
} from '@elastic/eui'

import { Theme } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import darkLogo from 'uiSrc/assets/img/dark_logo.svg'
import lightLogo from 'uiSrc/assets/img/light_logo.svg'

import styles from '../styles.module.scss'

const ConsentsSettingsPopup = () => {
  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CONSENT_MENU_VIEWED
    })
  }, [])

  return (
    <EuiOverlayMask>
      <EuiModal className={styles.consentsPopup} onClose={() => {}} data-testid="consents-settings-popup">
        <EuiModalHeader className={styles.modalHeader}>
          <EuiFlexGroup justifyContent="flexEnd">
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
          <EuiTitle size="xs">
            <EuiText className={styles.consentsPopupTitle}>EULA and Privacy Settings</EuiText>
          </EuiTitle>
          <EuiSpacer size="xl" />

          <ConsentsSettings />
        </EuiModalBody>
      </EuiModal>
    </EuiOverlayMask>
  )
}

export default ConsentsSettingsPopup
