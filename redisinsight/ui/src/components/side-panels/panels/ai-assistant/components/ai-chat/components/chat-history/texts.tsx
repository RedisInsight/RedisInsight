import { EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

export const AiChatInitialMessage = (
  <>
    <EuiText size="xs">Hi!</EuiText>
    <EuiText size="xs">Feel free to ask me anything about Redis or have me generate a query for your data.</EuiText>
    <EuiText size="xs">Use <b>/help</b> to get more info on what questions I can answer.</EuiText>
    <EuiSpacer />
    <EuiText size="xs">With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!</EuiText>
  </>
)
