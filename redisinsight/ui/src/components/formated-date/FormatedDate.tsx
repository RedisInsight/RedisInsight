import React from 'react'
import { useSelector } from 'react-redux'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { formatTimestamp } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  date: Date | string | number
}

const FormatedDate = ({ date }: Props) => {
  const config = useSelector(userSettingsConfigSelector)
  const dateFormat = config?.dateFormat || DATETIME_FORMATTER_DEFAULT
  const timezone = config?.timezone || TimezoneOption.Local

  const formatedDate = formatTimestamp(date, dateFormat, timezone)

  return (
    <span className={styles.text}>
      {formatedDate}
    </span>
  )
}

export default FormatedDate
