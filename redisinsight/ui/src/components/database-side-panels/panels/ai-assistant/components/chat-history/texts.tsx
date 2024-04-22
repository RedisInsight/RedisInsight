import { EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

export const AssistanceChatInitialMessage = (
  <>
    <EuiText size="xs">Hi!</EuiText>
    <EuiText size="xs">Feel free to engage in a general conversation with me about Redis.</EuiText>
    <EuiText size="xs">Or go to the <b>Database</b> tab data for help to query your indexed data.</EuiText>
    <EuiText size="xs">Type /help for more info.</EuiText>
    <EuiSpacer />
    <EuiText size="xs">With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!</EuiText>
  </>
)

export const ExpertChatInitialMessage = (
  <>
    <EuiText size="xs">Welcome!</EuiText>
    <EuiText size="xs">I am here to help you get started with data querying.</EuiText>
    <EuiText size="xs">Or go to the <b>General</b> tab to ask questions about Redis.</EuiText>
    <EuiSpacer />
    <EuiText size="xs">With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!</EuiText>
  </>
)
