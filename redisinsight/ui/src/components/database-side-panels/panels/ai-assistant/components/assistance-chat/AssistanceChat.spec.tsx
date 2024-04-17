import React from 'react'
import { cloneDeep } from 'lodash'
import { act, cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import {
  aiAssistantChatSelector,
  createAssistantChat,
  getAssistantChatHistory, removeAssistantChatHistory,
  sendQuestion
} from 'uiSrc/slices/panels/aiAssistant'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import AssistanceChat from './AssistanceChat'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiAssistantChatSelector: jest.fn().mockReturnValue({
    id: '',
    messages: []
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('AssistanceChat', () => {
  it('should render', () => {
    expect(render(<AssistanceChat />)).toBeTruthy()
  })

  it('should proper components render by default', () => {
    render(<AssistanceChat />)

    expect(screen.getByTestId('ai-general-restart-session-btn')).toBeInTheDocument()
    expect(screen.getByTestId('empty-chat-container')).toBeInTheDocument()
    expect(screen.getByTestId('ai-submit-message-btn')).toBeInTheDocument()
  })

  it('should call proper actions by default', () => {
    render(<AssistanceChat />)

    expect(store.getActions()).toEqual([])
  })

  it('should get history', () => {
    (aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: []
    })
    render(<AssistanceChat />)

    expect(store.getActions()).toEqual([getAssistantChatHistory()])
  })

  it('should call action to create an id after submit first message', () => {
    (aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '',
      messages: []
    })
    render(<AssistanceChat />)

    act(() => {
      fireEvent.change(
        screen.getByTestId('ai-message-textarea'),
        { target: { value: 'test' } }
      )
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(store.getActions()).toEqual([createAssistantChat()])
  })

  it('should call action after submit message', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: []
    })
    render(<AssistanceChat />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.change(
        screen.getByTestId('ai-message-textarea'),
        { target: { value: 'test' } }
      )
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      sendQuestion('test')
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Assistance
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call action after click on restart session', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: [{}]
    })

    render(<AssistanceChat />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('ai-general-restart-session-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      removeAssistantChatHistory()
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Assistance
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
