import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  mockedStoreFn,
  render,
  screen,
  waitForEuiPopoverVisible
} from 'uiSrc/utils/test-utils'

import {
  aiExpertChatSelector,
  clearExpertChatHistory,
  getExpertChatHistory,
  sendExpertQuestion,
} from 'uiSrc/slices/panels/aiAssistant'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { apiService } from 'uiSrc/services'
import ExpertChat from './ExpertChat'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiExpertChatSelector: jest.fn().mockReturnValue({
    loading: false,
    messages: []
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStoreFn())
  store.clearActions()
})

describe('ExpertChat', () => {
  it('should render', () => {
    expect(render(<ExpertChat />)).toBeTruthy()
  })

  it('should proper components render by default', () => {
    render(<ExpertChat />)

    expect(screen.getByTestId('ai-expert-restart-session-btn')).toBeInTheDocument()
    expect(screen.getByTestId('ai-chat-empty-history')).toBeInTheDocument()
    expect(screen.getByTestId('ai-submit-message-btn')).toBeInTheDocument()
  })

  it('should show loading', () => {
    (aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: true,
      messages: []
    })
    render(<ExpertChat />)

    expect(screen.getByTestId('ai-loading-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-chat-empty-history')).not.toBeInTheDocument()
  })

  it('should call proper actions by default', () => {
    render(<ExpertChat />, { store })

    expect(store.getActions()).toEqual([getExpertChatHistory()])
  })

  it('should call action after submit message', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: false,
      messages: []
    })
    render(<ExpertChat />, { store })

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
      sendExpertQuestion('test')
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Query
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call action after click on restart session', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    apiService.delete = jest.fn().mockResolvedValueOnce({ status: 200 });

    (aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: false,
      messages: [{}]
    })

    render(<ExpertChat />, { store })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('ai-expert-restart-session-btn'))

    await waitForEuiPopoverVisible()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ai-chat-restart-confirm'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      clearExpertChatHistory()
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Query
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
