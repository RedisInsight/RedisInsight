import { EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

export const AssistanceEmptyHistoryText = (
  <>
    <EuiText size="xs">
      Feel free to engage in a conversation about Redis in
      General or type / for specialized expertise in the context of a Database.
    </EuiText>
    <EuiSpacer />
    <EuiText size="xs">
      With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs" color="subdued">
      <i>*I am powered by AI so errors can happen. Feedback welcome. Thank you!</i>
    </EuiText>
  </>
)

export const ExpertEmptyHistoryText = (
  <>
    <EuiText size="xs">
      Type /query to generate a query based on your prompt.
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs">
      Stay tuned. We are working on adding more specialized expertise.
    </EuiText>
    <EuiSpacer />
    <EuiText size="xs">
      With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
    </EuiText>
    <EuiSpacer size="xs" />
    <EuiText size="xs" color="subdued">
      <i>*I am powered by AI so errors can happen. Feedback welcome. Thank you!</i>
    </EuiText>
  </>
)
