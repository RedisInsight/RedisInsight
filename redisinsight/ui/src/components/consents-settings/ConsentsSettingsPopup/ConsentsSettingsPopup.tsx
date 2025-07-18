import React, { useContext, useEffect } from 'react'
import {
  EuiOverlayMask,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
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

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Title } from 'uiSrc/components/base/text/Title'
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
              <Title size="L" className={styles.consentsPopupTitle}>
                EULA and Privacy Settings
              </Title>
            </FlexItem>
            <FlexItem>
              <RiIcon className={styles.redisIcon} type="RedisLogoFullIcon" />
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
