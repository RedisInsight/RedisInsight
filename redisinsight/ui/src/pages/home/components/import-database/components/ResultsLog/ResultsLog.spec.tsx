import React from 'react'
import { render, screen, fireEvent, within } from 'uiSrc/utils/test-utils'
import { ImportDatabasesData } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ResultsLog from './ResultsLog'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedError = { statusCode: 400, message: 'message', error: 'error' }
describe('ResultsLog', () => {
  it('should render', () => {
    const mockedData = { total: 0, fail: [], partial: [], success: [] }
    render(<ResultsLog data={mockedData} />)
  })

  it('should be all collapsed nav groups', () => {
    const mockedData: ImportDatabasesData = {
      total: 3,
      fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
      partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
      success: [{ index: 1, status: 'success', port: 1233, host: 'localhost' }]
    }
    render(<ResultsLog data={mockedData} />)

    expect(screen.getByTestId('success-results-closed')).toBeInTheDocument()
    expect(screen.getByTestId('partial-results-closed')).toBeInTheDocument()
    expect(screen.getByTestId('failed-results-closed')).toBeInTheDocument()
  })

  it('should open and collapse other groups', () => {
    const mockedData: ImportDatabasesData = {
      total: 3,
      fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
      partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
      success: [{ index: 1, status: 'success', port: 1233, host: 'localhost' }]
    }
    render(<ResultsLog data={mockedData} />)

    fireEvent.click(
      within(screen.getByTestId('success-results-closed')).getByRole('button')
    )
    expect(screen.getByTestId('success-results-open')).toBeInTheDocument()

    expect(screen.getByTestId('partial-results-closed')).toBeInTheDocument()
    expect(screen.getByTestId('failed-results-closed')).toBeInTheDocument()

    fireEvent.click(
      within(screen.getByTestId('failed-results-closed')).getByRole('button')
    )
    expect(screen.getByTestId('failed-results-open')).toBeInTheDocument()

    expect(screen.getByTestId('partial-results-closed')).toBeInTheDocument()
    expect(screen.getByTestId('success-results-closed')).toBeInTheDocument()

    fireEvent.click(
      within(screen.getByTestId('partial-results-closed')).getByRole('button')
    )
    expect(screen.getByTestId('partial-results-open')).toBeInTheDocument()

    expect(screen.getByTestId('failed-results-closed')).toBeInTheDocument()
    expect(screen.getByTestId('success-results-closed')).toBeInTheDocument()
  })

  it('should show proper items length', () => {
    const mockedData: ImportDatabasesData = {
      total: 4,
      fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
      partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
      success: [
        { index: 1, status: 'success', port: 1233, host: 'localhost' },
        { index: 3, status: 'success', port: 1233, host: 'localhost' }
      ]
    }
    render(<ResultsLog data={mockedData} />)

    expect(
      within(screen.getByTestId('success-results-closed')).getByTestId('number-of-dbs')
    ).toHaveTextContent('2')
    expect(
      within(screen.getByTestId('partial-results-closed')).getByTestId('number-of-dbs')
    ).toHaveTextContent('1')
    expect(
      within(screen.getByTestId('failed-results-closed')).getByTestId('number-of-dbs')
    ).toHaveTextContent('1')
  })

  it('should call proper telemetry event after click', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const mockedData: ImportDatabasesData = {
      total: 3,
      fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
      partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
      success: [{ index: 1, status: 'success', port: 1233, host: 'localhost' }]
    }
    render(<ResultsLog data={mockedData} />)

    fireEvent.click(
      within(screen.getByTestId('success-results-closed')).getByRole('button')
    )

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_LOG_VIEWED,
      eventData: {
        length: 1,
        name: 'success'
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(
      within(screen.getByTestId('success-results-open')).getByRole('button')
    )

    expect(sendEventTelemetry).not.toBeCalled()
  })
})
