import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {
  TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA,
} from 'uiSrc/mocks/data/triggeredFunctions'
import {
  setSelectedLibraryToShow
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import FunctionDetails from './FunctionDetails'

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

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedItem = TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA[0]
const mockedItemStreamTrigger = TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA[4]
const mockedItemKeySpaceTriggers = TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA[3]

describe('FunctionDetails', () => {
  it('should render', () => {
    expect(render(<FunctionDetails item={mockedItem} onClose={jest.fn()} />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(<FunctionDetails item={mockedItem} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('close-right-panel-btn'))
    expect(onClose).toBeCalled()
  })

  it('should render proper content for functions type', async () => {
    render(<FunctionDetails item={mockedItem} onClose={jest.fn()} />)

    expect(screen.getByTestId('function-name')).toHaveTextContent(mockedItem.name)
    expect(screen.getByTestId('function-details-General')).toHaveTextContent([
      'General',
      'Library:',
      mockedItem.library,
      'isAsync:',
      mockedItem.isAsync ? 'Yes' : 'No'
    ].join(''))

    expect(screen.getByTestId('function-details-Description')).toHaveTextContent(mockedItem.description!)
    expect(screen.getByTestId('function-details-Flags')).toHaveTextContent(mockedItem.flags?.join('')!)
  })

  it('should render proper content for keyspace triggers type', async () => {
    render(<FunctionDetails item={mockedItemKeySpaceTriggers} onClose={jest.fn()} />)

    expect(screen.getByTestId('function-name')).toHaveTextContent(mockedItemKeySpaceTriggers.name)
    expect(screen.getByTestId('function-details-General')).toHaveTextContent([
      'General',
      'Library:',
      mockedItemKeySpaceTriggers.library,
      'Total:',
      mockedItemKeySpaceTriggers.total,
      'Success:',
      mockedItemKeySpaceTriggers.success,
      'Failed:',
      mockedItemKeySpaceTriggers.fail,
    ].join(''))

    expect(screen.getByTestId('function-details-Description')).toHaveTextContent(mockedItemKeySpaceTriggers.description!)
    expect(screen.queryByTestId('function-details-Flags')).not.toBeInTheDocument()
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<FunctionDetails item={mockedItem} onClose={jest.fn()} />)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_VIEWED,
      eventData: {
        databaseId: 'instanceId',
        functionType: mockedItem.type,
        isAsync: mockedItem.isAsync
      }
    })

    sendEventTelemetry.mockRestore()
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<FunctionDetails item={mockedItemKeySpaceTriggers} onClose={jest.fn()} />)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_VIEWED,
      eventData: {
        databaseId: 'instanceId',
        functionType: mockedItemKeySpaceTriggers.type,
        isAsync: mockedItemKeySpaceTriggers.isAsync
      }
    })

    sendEventTelemetry.mockRestore()
  })

  it('should call proper actions and history to move to the library', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<FunctionDetails item={mockedItem} onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('moveToLibrary-libStringLong'))

    const expectedActions = [setSelectedLibraryToShow('libStringLong')]
    expect(store.getActions()).toEqual(expectedActions)

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/triggered-functions/libraries')
  })

  it('should render invoke button with function type', () => {
    render(<FunctionDetails item={mockedItem} onClose={jest.fn()} />)

    expect(screen.getByTestId('invoke-btn')).toBeInTheDocument()
  })

  it('should render invoke button with stream triggers type', () => {
    render(<FunctionDetails item={mockedItemStreamTrigger} onClose={jest.fn()} />)

    expect(screen.getByTestId('invoke-btn')).toBeInTheDocument()
  })

  it('should not render invoke button', () => {
    render(<FunctionDetails item={mockedItemKeySpaceTriggers} onClose={jest.fn()} />)

    expect(screen.queryByTestId('invoke-btn')).not.toBeInTheDocument()
  })

  it('should call proper telemetry events on invoke', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<FunctionDetails item={mockedItem} onClose={jest.fn()} />)

    sendEventTelemetry.mockRestore()

    fireEvent.click(screen.getByTestId('invoke-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_INVOKE_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        isAsync: mockedItem.isAsync,
        functionType: 'functions',
      }
    })

    sendEventTelemetry.mockRestore()

    fireEvent.click(screen.getByTestId('cancel-invoke-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_INVOKE_CANCELLED,
      eventData: {
        databaseId: 'instanceId',
        functionType: 'functions',
      }
    })
  })
})
