import React, { useContext, useEffect } from 'react'
import {
  EuiOverlayMask,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiIcon,
  EuiTitle,
} from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'

import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Pages, Theme } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Logo from 'uiSrc/assets/img/logo.svg'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from '../styles.module.scss'

const ConsentsSettingsPopup = () => {
  const history = useHistory()
  const { server } = useSelector(appInfoSelector)
  const { theme } = useContext(ThemeContext)

  const handleSubmitted = () => {
    if (
      server &&
      server.buildType === BuildType.RedisStack &&
      server?.fixedDatabaseId
    ) {
      history.push(Pages.browser(server.fixedDatabaseId))
    }
  }

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CONSENT_MENU_VIEWED,
    })
  }, [])

  return (
    <EuiOverlayMask
      className={cx(
        styles.overlay,
        theme === Theme.Dark ? styles.overlay_dark : styles.overlay_light,
      )}
    >
      <EuiModal
        className={styles.consentsPopup}
        onClose={() => {}}
        data-testid="consents-settings-popup"
      >
        <EuiModalHeader className={styles.modalHeader}>
          <Row justify="between">
            <FlexItem>
              <EuiTitle size="s">
                <h3 className={styles.consentsPopupTitle}>
                  EULA and Privacy Settings
                </h3>
              </EuiTitle>
            </FlexItem>
            <FlexItem>
              <EuiIcon
                className={styles.redisIcon}
                size="original"
                type={Logo}
              />
            </FlexItem>
          </Row>
        </EuiModalHeader>
        <EuiModalBody className={styles.modalBody}>
          <ConsentsSettings onSubmitted={handleSubmitted} />
        </EuiModalBody>
      </EuiModal>
    </EuiOverlayMask>
  )
}

export default ConsentsSettingsPopup
