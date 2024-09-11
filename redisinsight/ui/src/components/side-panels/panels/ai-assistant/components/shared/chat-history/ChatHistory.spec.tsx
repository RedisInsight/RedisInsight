import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import { AiChatMessage, AiChatMessageType, BotType } from 'uiSrc/slices/interfaces/aiAssistant'
import ChatHistory, { Props } from './ChatHistory'

const mockedProps = mock<Props>()

const history: AiChatMessage[] = [
  {
    content: '1',
    type: AiChatMessageType.HumanMessage,
    id: '1',
    tool: BotType.General
  },
  {
    content: '2',
    type: AiChatMessageType.AIMessage,
    id: '2',
    tool: BotType.General
  },
  {
    content: '3',
    type: AiChatMessageType.HumanMessage,
    id: '3',
    tool: BotType.General
  },
  {
    content: '4',
    type: AiChatMessageType.AIMessage,
    id: '4',
    tool: BotType.General
  }
]

describe('ChatHistory', () => {
  it('should render', () => {
    expect(render(<ChatHistory {...mockedProps} />)).toBeTruthy()
  })

  it('should render intial chat message when history is empty', () => {
    render(<ChatHistory {...mockedProps} history={[]} />)

    expect(screen.getByTestId('ai-message-initial-message')).toBeInTheDocument()
  })

  it('should render loading answer indicator', () => {
    render(<ChatHistory {...mockedProps} history={history} inProgressMessage={{ content: '' } as any} />)

    expect(screen.getByTestId('ai-loading-answer')).toBeInTheDocument()
  })

  it('should render history', () => {
    render(<ChatHistory {...mockedProps} history={history} />)

    history.forEach(({ id, type }) => {
      expect(screen.getByTestId(`ai-message-${type}_${id}`)).toBeInTheDocument()
    })
  })
})
