import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  mockedStoreFn,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { aiChatSelector, getAiAgreement, getAiChatHistory, getAiDatabaseAgreement } from 'uiSrc/slices/panels/aiAssistant'
import AiChat from './AiChat'

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiChatSelector: jest.fn().mockReturnValue({
    loading: false,
    messages: [],
    agreements: [],
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStoreFn())
  store.clearActions()
})

describe('AiChat', () => {
  it('should render', () => {
    expect(render(<AiChat />)).toBeTruthy()
  })

  it('should proper components render by default', () => {
    render(<AiChat />, { store })

    expect(screen.getByTestId('ai-restart-session-btn')).toBeInTheDocument()
    expect(screen.getByTestId('ai-chat-empty-history')).toBeInTheDocument()
    expect(screen.getByTestId('ai-submit-message-btn')).toBeInTheDocument()
  })

  it('should get history', () => {
    (aiChatSelector as jest.Mock).mockReturnValue({
      messages: [],
    })
    render(<AiChat />, { store })

    expect(store.getActions()).toEqual([getAiDatabaseAgreement(), getAiChatHistory(), getAiAgreement()])
  })

  it('should have a disabled input if general Ai Agreement not accepted', () => {
    (aiChatSelector as jest.Mock).mockReturnValue({
      messages: [],
    })
    render(<AiChat />, { store })

    expect(screen.getByTestId('ai-message-textarea')).toBeDisabled()
  })

  it('should not show copilotSettings popover if general Ai Agreement accepted', () => {
    (aiChatSelector as jest.Mock).mockReturnValue({
      messages: [],
      generalAgreement: { consent: true }
    })
    render(<AiChat />, { store })

    expect(screen.queryAllByTestId('copilot-settings-action-btn')).toHaveLength(0)
    expect(screen.getByTestId('ai-message-textarea')).toBeEnabled()
  })
})
