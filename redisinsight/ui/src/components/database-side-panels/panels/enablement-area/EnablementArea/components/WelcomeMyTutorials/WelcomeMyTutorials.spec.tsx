import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'

import WelcomeMyTutorials from './WelcomeMyTutorials'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('WelcomeMyTutorials', () => {
  it('should render', () => {
    expect(render(<WelcomeMyTutorials handleOpenUpload={jest.fn()} />)).toBeTruthy()
  })

  it('should call handleOpenUpload', () => {
    const mockHandleOpenUpload = jest.fn()
    render(<WelcomeMyTutorials handleOpenUpload={mockHandleOpenUpload} />)

    fireEvent.click(screen.getByTestId('upload-tutorial-btn'))

    expect(mockHandleOpenUpload).toBeCalled()
  })

  it('should call proper telemetry event after click read more', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)
    render(<WelcomeMyTutorials handleOpenUpload={jest.fn()} />)

    fireEvent.click(screen.getByTestId('read-more-link'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_TUTORIAL_INFO_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      }
    })
    sendEventTelemetry.mockRestore()
  })
})
