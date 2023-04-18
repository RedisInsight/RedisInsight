import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui'
import React from 'react'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'

import styles from './styles.modules.scss'

export interface Props {
  processed?: number
  succeed?: number
  failed?: number
  duration?: number
  'data-testid': string
}
const BulkActionSummary = ({ processed = 0, succeed = 0, failed = 0, duration = 0, 'data-testid': testId }: Props) => (
  <EuiFlexGroup
    alignItems="flexStart"
    direction="row"
    gutterSize="none"
    responsive={false}
    className={styles.summary}
    data-testid={testId}
  >
    <EuiFlexItem grow={false}>
      <EuiText className={styles.summaryValue}>{numberWithSpaces(processed)}</EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>Keys Processed</EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiText className={styles.summaryValue}>{numberWithSpaces(succeed)}</EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>Success</EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiText className={styles.summaryValue}>{numberWithSpaces(failed)}</EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>Errors</EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiText className={styles.summaryValue}>{millisecondsFormat(duration, 'H:mm:ss.SSS')}</EuiText>
      <EuiText color="subdued" className={styles.summaryLabel}>Time Taken</EuiText>
    </EuiFlexItem>
  </EuiFlexGroup>
)

export default BulkActionSummary
