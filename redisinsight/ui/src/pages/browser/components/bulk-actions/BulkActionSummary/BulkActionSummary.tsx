import { EuiText } from '@elastic/eui'
import React from 'react'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'
import { BulkActionsType } from 'uiSrc/constants'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

export interface Props {
  type?: BulkActionsType
  processed?: number
  succeed?: number
  failed?: number
  duration?: number
  'data-testid': string
}
const BulkActionSummary = ({
  type = BulkActionsType.Delete,
  processed = 0,
  succeed = 0,
  failed = 0,
  duration = 0,
  'data-testid': testId,
}: Props) => (
  <Row align="start" className={styles.summary} data-testid={testId}>
    <FlexItem>
      <EuiText className={styles.summaryValue}>
        {numberWithSpaces(processed)}
      </EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>
        {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
      </EuiText>
    </FlexItem>
    <FlexItem>
      <EuiText className={styles.summaryValue}>
        {numberWithSpaces(succeed)}
      </EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>
        Success
      </EuiText>
    </FlexItem>
    <FlexItem>
      <EuiText className={styles.summaryValue}>
        {numberWithSpaces(failed)}
      </EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>
        Errors
      </EuiText>
    </FlexItem>
    <FlexItem>
      <EuiText className={styles.summaryValue}>
        {millisecondsFormat(duration, 'H:mm:ss.SSS')}
      </EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>
        Time Taken
      </EuiText>
    </FlexItem>
  </Row>
)

export default BulkActionSummary
