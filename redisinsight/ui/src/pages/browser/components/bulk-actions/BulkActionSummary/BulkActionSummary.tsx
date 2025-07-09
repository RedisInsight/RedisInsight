import React from 'react'
import { EuiText } from '@elastic/eui'
import styled from 'styled-components'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'
import { BulkActionsType } from 'uiSrc/constants'

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
      <EuiText color="subdued">
        {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
      </EuiText>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{numberWithSpaces(succeed)}</SummaryValue>
      <EuiText color="subdued">Success</EuiText>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{numberWithSpaces(failed)}</SummaryValue>
      <EuiText color="subdued">Errors</EuiText>
    </FlexItem>
    <FlexItem>
      <SummaryValue>{millisecondsFormat(duration, 'H:mm:ss.SSS')}</SummaryValue>
      <EuiText color="subdued">Time Taken</EuiText>
    </FlexItem>
  </SummaryContainer>
)

export default BulkActionSummary
