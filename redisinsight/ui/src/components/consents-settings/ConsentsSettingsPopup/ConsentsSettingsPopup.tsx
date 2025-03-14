import React, { useEffect } from 'react'
import { EuiIcon, EuiTitle } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Pages } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Logo from 'uiSrc/assets/img/logo.svg'
import { RIModal } from 'uiSrc/components/ui/modal'
import { FixedItem, Row } from 'uiSrc/components/ui/layout/flex'

import styles from '../styles.module.scss'

const Title = () => (
  <Row justifyContent="spaceBetween">
    <FixedItem>
      <EuiTitle size="s">
        <h3 className={styles.consentsPopupTitle}>EULA and Privacy Settings</h3>
      </EuiTitle>
    </FixedItem>
    <FixedItem>
      <EuiIcon className={styles.redisIcon} size="original" type={Logo} />
    </FixedItem>
  </Row>
)

const ConsentsSettingsPopup = () => {
  const history = useHistory()
  const { server } = useSelector(appInfoSelector)

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
    <RIModal
      className={styles.consentsPopup}
      classNameHeader={styles.modalHeader}
      classNameBody={styles.modalBody}
      closable={false}
      data-testid="consents-settings-popup"
      isOpen
      title={<Title />}
    >
      <ConsentsSettings onSubmitted={handleSubmitted} />
    </RIModal>
  )
}

export default ConsentsSettingsPopup
