import React from 'react'
import { map } from 'lodash'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { INSTANCES_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import DeleteAction from './DeleteAction'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('DeleteAction', () => {
  it('should render', () => {
    expect(render(<DeleteAction selection={[]} onDelete={jest.fn()} />)).toBeTruthy()
  })

  it('should call onDelete with proper data', () => {
    const onDelete = jest.fn()
    render(<DeleteAction
      selection={INSTANCES_MOCK}
      onDelete={onDelete}
    />)

    fireEvent.click(screen.getByTestId('delete-btn'))
    fireEvent.click(screen.getByTestId('delete-selected-dbs'))

    expect(onDelete).toBeCalledWith(INSTANCES_MOCK)
  })

  it('should call telemetry on click delete btn', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<DeleteAction
      selection={INSTANCES_MOCK}
      onDelete={jest.fn()}
    />)

    fireEvent.click(screen.getByTestId('delete-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        databasesIds: map(INSTANCES_MOCK, 'id')
      }
    })
  })
})
