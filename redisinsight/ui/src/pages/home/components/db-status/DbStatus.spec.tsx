import React from 'react'
import { mock } from 'ts-mockito'
import { act, fireEvent, render, screen, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import DbStatus, { Props, WarningTypes } from './DbStatus'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedProps = mock<Props>()
const daysToMs = (days: number) => days * 60 * 60 * 24 * 1000

describe('DbStatus', () => {
  it('should render', () => {
    expect(render(<DbStatus {...mockedProps} />)).toBeTruthy()
  })

  it('should not render any status', () => {
    render(<DbStatus {...mockedProps} id="1" />)

    expect(screen.queryByTestId('database-status-new-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId(`database-status-${WarningTypes.TryDatabase}-1`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`database-status-${WarningTypes.CheckIfDeleted}-1`)).not.toBeInTheDocument()
  })

  it('should render TryDatabase status', () => {
    const lastConnection = new Date(Date.now() - daysToMs(3))
    render(<DbStatus {...mockedProps} id="1" lastConnection={lastConnection} isFree />)

    expect(screen.getByTestId(`database-status-${WarningTypes.TryDatabase}-1`)).toBeInTheDocument()
    expect(screen.queryByTestId('database-status-new-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId(`database-status-${WarningTypes.CheckIfDeleted}-1`)).not.toBeInTheDocument()
  })

  it('should render CheckIfDeleted status', () => {
    const lastConnection = new Date(Date.now() - daysToMs(16))
    render(<DbStatus {...mockedProps} id="1" lastConnection={lastConnection} isFree isNew />)

    expect(screen.getByTestId(`database-status-${WarningTypes.CheckIfDeleted}-1`)).toBeInTheDocument()

    expect(screen.queryByTestId('database-status-new-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId(`database-status-${WarningTypes.TryDatabase}-1`)).not.toBeInTheDocument()
  })

  it('should render new status', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const lastConnection = new Date(Date.now() - daysToMs(3))
    render(<DbStatus {...mockedProps} id="1" lastConnection={lastConnection} isFree />)

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId(`database-status-${WarningTypes.TryDatabase}-1`))
    })

    await waitForEuiToolTipVisible(1_000)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_NOT_USED_DB_NOTIFICATION_VIEWED,
      eventData: {
        capability: expect.any(String),
        databaseId: '1',
        type: WarningTypes.TryDatabase
      }
    })
  })
})
