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
const SummaryValue = styled(Text)`
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
      <SummaryValue color="subdued">
        {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
      </SummaryValue>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{numberWithSpaces(succeed)}</SummaryValue>
      <SummaryValue color="subdued">Success</SummaryValue>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{numberWithSpaces(failed)}</SummaryValue>
      <SummaryValue color="subdued">Errors</SummaryValue>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{millisecondsFormat(duration, 'H:mm:ss.SSS')}</SummaryValue>
      <SummaryValue color="subdued">Time Taken</SummaryValue>
    </FlexItem>
  </SummaryContainer>
)

export default BulkActionSummary
