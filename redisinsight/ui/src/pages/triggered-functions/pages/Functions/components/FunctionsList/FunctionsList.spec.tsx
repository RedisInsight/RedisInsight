import React from 'react'

import { mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA } from 'uiSrc/mocks/data/triggeredFunctions'
import FunctionsList, { Props } from './FunctionsList'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedFunctions = TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA

const mockedProps = mock<Props>()

describe('FunctionsList', () => {
  it('should render', () => {
    expect(render(<FunctionsList {...mockedProps} items={mockedFunctions} />)).toBeTruthy()
  })

  it('should render items properly', () => {
    render(<FunctionsList {...mockedProps} items={mockedFunctions} />)

    expect(screen.getByTestId('total-functions')).toHaveTextContent('Total: 5')
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(5)
  })

  it('should call proper telemetry events', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<FunctionsList {...mockedProps} items={mockedFunctions} />)

    fireEvent.click(screen.getByTestId('functions-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_LIST_REFRESH_CLICKED,
      eventData: {
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()

    fireEvent.click(screen.getByTestId('functions-auto-refresh-config-btn'))
    fireEvent.click(screen.getByTestId('functions-auto-refresh-switch'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_LIST_AUTO_REFRESH_ENABLED,
      eventData: {
        refreshRate: '5.0',
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()
    fireEvent.click(screen.getByTestId('functions-auto-refresh-switch'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_LIST_AUTO_REFRESH_DISABLED,
      eventData: {
        refreshRate: '5.0',
        databaseId: 'instanceId'
      }
    })
  })

  it('should render disabled auto refresh btn', () => {
    render(<FunctionsList {...mockedProps} isRefreshDisabled />)

    expect(screen.getByTestId('functions-refresh-btn')).toBeDisabled()
  })

  it('should call proper telemetry events when sorting is changed', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    const { container } = render(<FunctionsList {...mockedProps} items={mockedFunctions} />)

    fireEvent.click(container.querySelector('[data-test-subj="tableHeaderSortButton"') as HTMLInputElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTIONS_SORTED,
      eventData: {
        databaseId: 'instanceId',
        direction: 'asc',
        field: 'name',
      }
    })

    sendEventTelemetry.mockRestore()
  })
})
