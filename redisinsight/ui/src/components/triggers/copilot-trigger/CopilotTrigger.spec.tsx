import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import CopilotTrigger from './CopilotTrigger'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiAssistantSelector: jest.fn().mockReturnValue({
    hideCopilotSplashScreen: null
  })
}))

describe('CopilotTrigger', () => {
  it('should render', () => {
    expect(render(<CopilotTrigger />)).toBeTruthy()
  })

  it('should send telemetry with necessary data', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<CopilotTrigger />)

    fireEvent.click(screen.getByTestId('copilot-trigger'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        action: 'open',
        authenticated: false,
        firstUse: true,
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
