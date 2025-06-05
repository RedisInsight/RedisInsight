import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { EuiTitle } from '@elastic/eui'
import { formatTimestamp } from 'uiSrc/utils'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import TimezoneForm from './components/timezone-form/TimezoneForm'
import DatetimeForm from './components/datetime-form/DatetimeForm'
import styles from './styles.module.scss'

const DateTimeFormatter = () => {
  const [preview, setPreview] = useState('')
  const config = useSelector(userSettingsConfigSelector)

  useEffect(() => {
    setPreview(
      formatTimestamp(
        new Date(),
        config?.dateFormat || DATETIME_FORMATTER_DEFAULT,
        config?.timezone || TimezoneOption.Local,
      ),
    )
  }, [config?.dateFormat, config?.timezone])

  return (
    <>
      <EuiTitle size="xs">
        <h4>Date and Time Format</h4>
      </EuiTitle>
      <Spacer size="m" />
      <Text color="subdued" className={styles.dateTimeSubtitle}>
        Specifies the date and time format to be used in Redis Insight:
      </Text>
      <Spacer size="m" />
      <DatetimeForm onFormatChange={(newPreview) => setPreview(newPreview)} />
      <Spacer size="m" />
      <Text className={styles.dateTimeSubtitle} color="subdued">
        Specifies the time zone to be used in Redis Insight:
      </Text>
      <Spacer size="s" />
      <div>
        <Row align="center" gap="m" responsive>
          <FlexItem grow={1}>
            <TimezoneForm />
          </FlexItem>
          <FlexItem grow={2}>
            <div className={styles.previewContainer}>
              <Text className={styles.dateTimeSubtitle} color="subdued">
                Preview:
              </Text>
              <Text className={styles.preview} data-testid="data-preview">
                {preview}
              </Text>
            </div>
          </FlexItem>
        </Row>
      </div>
      <Spacer />
    </>
  )
}

export default DateTimeFormatter
