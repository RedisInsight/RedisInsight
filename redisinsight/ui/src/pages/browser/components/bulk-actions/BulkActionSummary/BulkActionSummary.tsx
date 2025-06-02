import React from 'react'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'
import { BulkActionsType } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
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
      <Text className={styles.summaryValue}>{numberWithSpaces(processed)}</Text>
      <Text color="subdued" className={styles.summaryLabel}>
        {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
      </Text>
    </FlexItem>
    <FlexItem>
      <Text className={styles.summaryValue}>{numberWithSpaces(succeed)}</Text>
      <Text color="subdued" className={styles.summaryLabel}>
        Success
      </Text>
    </FlexItem>
    <FlexItem>
      <Text className={styles.summaryValue}>{numberWithSpaces(failed)}</Text>
      <Text color="subdued" className={styles.summaryLabel}>
        Errors
      </Text>
    </FlexItem>
    <FlexItem>
      <Text className={styles.summaryValue}>
        {millisecondsFormat(duration, 'H:mm:ss.SSS')}
      </Text>
      <Text color="subdued" className={styles.summaryLabel}>
        Time Taken
      </Text>
    </FlexItem>
  </Row>
)

export default BulkActionSummary
