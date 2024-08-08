import { EuiToolTip } from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'
import { DATETIME_FORMATTER_DEFAULT } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { formatTimestamp } from 'uiSrc/utils'

export interface Prop {
  date: Date | string | number
  truncate?: number
}

const FormatedDate = ({ date, truncate }: Prop) => {
  const config = useSelector(userSettingsConfigSelector)
  const dateFormat = config?.dateFormat || DATETIME_FORMATTER_DEFAULT
  const timezone = config?.timezone || 'local'

  const formatedDate = formatTimestamp(date, dateFormat, timezone)
  return date.toString()

  if (truncate && dateFormat.length > truncate) {
    return (
      <EuiToolTip
        content={formatedDate}
      >
        <>{formatedDate.slice(0, truncate).concat('...')}</>
      </EuiToolTip>
    )
  }

  return (
    <span>{formatedDate}</span>
  )
}

export default FormatedDate
