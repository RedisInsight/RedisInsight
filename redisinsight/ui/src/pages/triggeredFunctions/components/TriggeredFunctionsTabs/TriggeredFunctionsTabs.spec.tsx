import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import TriggeredFunctionsTabs from './TriggeredFunctionsTabs'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

describe('TriggeredFunctionsTabs', () => {
  it('should render', () => {
    expect(render(<TriggeredFunctionsTabs path="" />)).toBeTruthy()
  })

  it('should call proper history push after click on tabs', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<TriggeredFunctionsTabs path="" />)

    fireEvent.click(screen.getByTestId('triggered-functions-tab-libraries'))
    expect(pushMock).toBeCalledWith('/instanceId/triggered-functions/libraries')

    fireEvent.click(screen.getByTestId('triggered-functions-tab-functions'))
    expect(pushMock).toBeCalledWith('/instanceId/triggered-functions/functions')
  })

  it('should call proper telemetry events', () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<TriggeredFunctionsTabs path="" />)

    fireEvent.click(screen.getByTestId('triggered-functions-tab-libraries'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARIES_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      }
    })
    sendEventTelemetry.mockRestore()

    fireEvent.click(screen.getByTestId('triggered-functions-tab-functions'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTIONS_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      }
    })
    sendEventTelemetry.mockRestore()
  })
})
