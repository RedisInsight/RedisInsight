import { EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

export const AssistanceChatInitialMessage = (
  <>
    <EuiText size="xs">Hi!</EuiText>
    <EuiText size="xs">Feel free to engage in a general conversation with me about Redis.</EuiText>
    <EuiText size="xs">Or switch to <b>My Data</b> tab to get assistance in the context of your data.</EuiText>
    <EuiText size="xs">Type <b>/help</b> for more info.</EuiText>
    <EuiSpacer />
    <EuiText size="xs">With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!</EuiText>
  </>
)
