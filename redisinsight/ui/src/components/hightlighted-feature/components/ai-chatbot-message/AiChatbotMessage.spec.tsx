import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { removeFeatureFromHighlighting } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import AiChatbotMessage from './AiChatbotMessage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})
describe('AiChatbotMessage', () => {
  it('should render', () => {
    expect(render(<AiChatbotMessage />)).toBeTruthy()
  })

  it('should call proper actions after click show me button', () => {
    render(<AiChatbotMessage />)

    fireEvent.click(screen.getByTestId('ai-chat-message-btn'))

    expect(store.getActions()).toEqual([
      changeSelectedTab(InsightsPanelTabs.AiAssistant),
      setSelectedTab(AiChatType.Assistance),
      toggleInsightsPanel(true),
      removeFeatureFromHighlighting('aiChatbot'),
    ])
  })

  it('should call proper telemetry', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<AiChatbotMessage />)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_MESSAGE_DISPLAYED,
    });

    (sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('ai-chat-message-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_MESSAGE_CLICKED,
    })
  })
})
