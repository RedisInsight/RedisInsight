import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import CopilotSplashScreen, { Props } from './CopilotSplashScreen'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('CopilotSplashScreen', () => {
  it('should render', () => {
    expect(render(<CopilotSplashScreen {...mockedProps} />)).toBeTruthy()
  })

  it('should call onClose when close Panel Btn is clicked', () => {
    const onClose = jest.fn()
    render(<CopilotSplashScreen {...mockedProps} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('close-copilot-splashscreen-btn'))
    expect(onClose).toBeCalled()
  })

  it('should send telemetry when get started clicked', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<CopilotSplashScreen {...mockedProps} />)

    fireEvent.click(screen.getByTestId('copilot-get-started-btn'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        action: 'open',
        authenticated: false,
        firstUse: true
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
