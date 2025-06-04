import { EuiText } from '@elastic/eui'
import React from 'react'
import { DurationUnits } from 'uiSrc/constants'
import { Title } from 'uiSrc/components/base/text/Title'
import { convertNumberByUnits } from 'uiSrc/pages/slow-log/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import styles from '../styles.module.scss'

export interface Props {
  durationUnit: DurationUnits
  slowlogLogSlowerThan: number
}

const EmptySlowLog = (props: Props) => {
  const { durationUnit, slowlogLogSlowerThan } = props

  return (
    <div className={styles.noSlowLogWrapper} data-testid="empty-slow-log">
      <div className={styles.noSlowLogText}>
        <Title size="M" className={styles.noFoundTitle}>
          No Slow Logs found
        </Title>
        <EuiText color="subdued">
          Either no commands exceeding&nbsp;
          {numberWithSpaces(
            convertNumberByUnits(slowlogLogSlowerThan, durationUnit),
          )}
          &nbsp;
          {durationUnit === DurationUnits.milliSeconds
            ? DurationUnits.mSeconds
            : DurationUnits.microSeconds}
          &nbsp;were found or Slow Log is disabled on the server.
        </EuiText>
      </div>
    </div>
  )
}

export default EmptySlowLog
