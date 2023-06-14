import React from 'react'

import { mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { TriggeredFunctionsLibrary } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import LibrariesList, { Props } from './LibrariesList'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedLibraries: TriggeredFunctionsLibrary[] = [
  {
    name: 'lib1',
    user: 'user1',
    totalFunctions: 2,
    pendingJobs: 1
  },
  {
    name: 'lib2',
    user: 'user1',
    totalFunctions: 2,
    pendingJobs: 1
  },
  {
    name: 'lib3',
    user: 'user2',
    totalFunctions: 2,
    pendingJobs: 1
  }
]

const mockedProps = mock<Props>()

describe('LibrariesList', () => {
  it('should render', () => {
    expect(render(<LibrariesList {...mockedProps} items={mockedLibraries} />)).toBeTruthy()
  })

  it('should render items properly', () => {
    render(<LibrariesList {...mockedProps} items={mockedLibraries} />)

    expect(screen.getByTestId('total-libraries')).toHaveTextContent('Total: 3')
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(3)
  })

  it('should call proper telemetry events', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<LibrariesList {...mockedProps} items={mockedLibraries} />)

    fireEvent.click(screen.getByTestId('refresh-libraries-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_LIST_REFRESH_CLICKED,
      eventData: {
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()

    fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
    fireEvent.click(screen.getByTestId('auto-refresh-switch'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_LIST_AUTO_REFRESH_ENABLED,
      eventData: {
        refreshRate: '5.0',
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()
    fireEvent.click(screen.getByTestId('auto-refresh-switch'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_LIST_AUTO_REFRESH_DISABLED,
      eventData: {
        refreshRate: '5.0',
        databaseId: 'instanceId'
      }
    })
  })
})
