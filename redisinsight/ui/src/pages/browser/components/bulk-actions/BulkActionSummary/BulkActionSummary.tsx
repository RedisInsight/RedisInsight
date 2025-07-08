import React from 'react'

import styled from 'styled-components'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'
import { BulkActionsType } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  type?: BulkActionsType
  processed?: number
  succeed?: number
  failed?: number
  duration?: number
  'data-testid': string
}

const SummaryContainer = styled(Row)`
  padding-top: 18px;
`
const SummaryValue = styled(EuiText)`
  font-size: 18px !important;
  line-height: 24px;
  font-weight: 500 !important;
`

const BulkActionSummary = ({
  type = BulkActionsType.Delete,
  processed = 0,
  succeed = 0,
  failed = 0,
  duration = 0,
  'data-testid': testId,
}: Props) => (
  <SummaryContainer data-testid={testId} gap="xl">
    <FlexItem>
      <SummaryValue>{numberWithSpaces(processed)}</SummaryValue>
      <Text color="subdued" className={styles.summaryLabel}>
        {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
      </Text>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{numberWithSpaces(succeed)}</SummaryValue>
      <Text color="subdued" className={styles.summaryLabel}>
        Success
      </Text>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{numberWithSpaces(failed)}</SummaryValue>
      <Text color="subdued" className={styles.summaryLabel}>
        Errors
      </Text>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{millisecondsFormat(duration, 'H:mm:ss.SSS')}</SummaryValue>
      <Text color="subdued" className={styles.summaryLabel}>
        Time Taken
      </Text>
    </FlexItem>
  </SummaryContainer>
)

export default BulkActionSummary
