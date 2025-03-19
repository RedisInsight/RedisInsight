import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { RedisLogoDarkFullIcon } from '@redislabsdev/redis-ui-icons/multicolor'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { Pages } from 'uiSrc/constants'
import { ConsentsSettings } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RIModal } from 'uiSrc/components/ui/modal'
import { FixedItem, Row } from 'uiSrc/components/ui/layout/flex'
import { Heading } from 'uiSrc/components/ui/typography/text'

import styles from '../styles.module.scss'

const Title = () => (
  <Row justifyContent="spaceBetween" alignItems="center">
    <FixedItem>
      <Heading size="L" className={styles.consentsPopupTitle} ellipsis>
        EULA and Privacy Settings
      </Heading>
    </FixedItem>

    <FixedItem className={styles.logo}>
      <RedisLogoDarkFullIcon size="XL" className={styles.redisIcon} />
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
