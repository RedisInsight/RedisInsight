import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { aiAssistantSelector } from 'uiSrc/slices/panels/aiAssistant'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import CopilotPanel, { Props } from './CopilotPanel'

const mockedProps = mock<Props>()

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

describe('CopilotPanel', () => {
  it('should render', () => {
    expect(render(<CopilotPanel {...mockedProps} />)).toBeTruthy()
  })

  it('should display SplashScreen when hideCopilotSplashScreen is not set to true', () => {
    render(<CopilotPanel {...mockedProps} />)

    expect(screen.getByTestId('copilot-get-started-btn')).toBeInTheDocument()
  })

  it('should not display SplashScreen when hideCopilotSplashScreen is set to true', () => {
    (aiAssistantSelector as jest.Mock).mockReturnValueOnce({
      hideCopilotSplashScreen: true
    })
    render(<CopilotPanel {...mockedProps} />)

    expect(screen.queryAllByTestId('copilot-get-started-btn')).toHaveLength(0)
  })

  it('should send telemetry with necessary data onClose', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<CopilotPanel {...mockedProps} />)

    fireEvent.click(screen.getByTestId('close-copilot-splashscreen-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        action: 'close',
        authenticated: false,
        firstUse: true,
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
