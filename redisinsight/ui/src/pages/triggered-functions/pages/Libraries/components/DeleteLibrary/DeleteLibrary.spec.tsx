import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { cleanup, mockedStore, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import {
  deleteTriggeredFunctionsLibrary,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'

import DeleteLibraryButton, { Props } from './DeleteLibrary'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedProps = mock<Props>()

const mockLibrary = {
  name: 'lib',
  pendingJobs: 1,
  user: 'default',
  totalFunctions: 0,
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    instanceId: 'instanceId',
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DeleteLibraryButton', () => {
  it('should render', () => {
    expect(render(<DeleteLibraryButton {...mockedProps} />)).toBeTruthy()
  })

  it('should call proper telemetry event', async () => {
    const openPopover = jest.fn()
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(
      <DeleteLibraryButton {...mockedProps} openPopover={openPopover} library={mockLibrary} />
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-library-icon-lib'))
    })

    expect(openPopover).toBeCalledWith('lib')
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DELETE_CLICKED,
      eventData: {
        databaseId: 'instanceId'
      }
    })
  })

  it('should call proper telemetry event', async () => {
    const closePopover = jest.fn()
    const onDelete = jest.fn()

    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(
      <DeleteLibraryButton
        {...mockedProps}
        isOpen
        library={mockLibrary}
        closePopover={closePopover}
        onDelete={onDelete}
      />
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-library-lib'))
    })

    expect(closePopover).toHaveBeenCalled()
    expect(sendEventTelemetry).toHaveBeenCalledTimes(2)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DELETE_CLICKED,
      eventData: {
        databaseId: 'instanceId'
      }
    })
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DELETED,
      eventData: {
        databaseId: 'instanceId',
        pendingJobs: 1,
      }
    })
  })

  it('should call deleteTriggeredFunctionsLibrary', async () => {
    const closePopover = jest.fn()

    const expectedActions = [deleteTriggeredFunctionsLibrary()]

    render(
      <DeleteLibraryButton {...mockedProps} closePopover={closePopover} isOpen library={mockLibrary} />
    )

    act(() => {
      fireEvent.click(screen.getByTestId('delete-library-lib'))
    })

    expect(store.getActions()).toEqual(expectedActions)
  })
})
