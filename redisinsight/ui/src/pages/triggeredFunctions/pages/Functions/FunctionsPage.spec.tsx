import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import {
  getTriggeredFunctionsFunctionsList,
  triggeredFunctionsFunctionsSelector,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA } from 'uiSrc/mocks/data/triggeredFunctions'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import FunctionsPage from './FunctionsPage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/triggeredFunctions/triggeredFunctions', () => ({
  ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions'),
  triggeredFunctionsFunctionsSelector: jest.fn().mockReturnValue({
    ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions').triggeredFunctionsFunctionsSelector
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedFunctions = TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA

describe('FunctionsPage', () => {
  it('should render', () => {
    expect(render(<FunctionsPage />)).toBeTruthy()
  })

  it('should fetch list of functions', () => {
    (triggeredFunctionsFunctionsSelector as jest.Mock).mockReturnValueOnce({
      data: null,
      loading: false
    })
    render(<FunctionsPage />)

    const expectedActions = [getTriggeredFunctionsFunctionsList()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render libraries list', async () => {
    (triggeredFunctionsFunctionsSelector as jest.Mock).mockReturnValueOnce({
      data: mockedFunctions,
      loading: false
    })
    render(<FunctionsPage />)

    expect(screen.getByTestId('functions-list-table')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(5)
  })

  it('should filter functions list', () => {
    (triggeredFunctionsFunctionsSelector as jest.Mock).mockReturnValueOnce({
      data: mockedFunctions,
      loading: false
    })
    render(<FunctionsPage />)

    fireEvent.change(
      screen.getByTestId('search-functions-list'),
      { target: { value: 'foo1' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(1)
    expect(screen.getByTestId('row-foo1')).toBeInTheDocument()

    fireEvent.change(
      screen.getByTestId('search-functions-list'),
      { target: { value: 'Functions' } }
    )

    expect(screen.queryAllByTestId(/^row-/).length).toEqual(4)
    expect(screen.getByTestId('row-foo1')).toBeInTheDocument()
    expect(screen.getByTestId('row-foo2')).toBeInTheDocument()
    expect(screen.getByTestId('row-foo3')).toBeInTheDocument()
    expect(screen.getByTestId('row-foo5')).toBeInTheDocument()

    fireEvent.change(
      screen.getByTestId('search-functions-list'),
      { target: { value: 'libStringLong' } }
    )

    expect(screen.queryAllByTestId(/^row-/).length).toEqual(5)

    fireEvent.change(
      screen.getByTestId('search-functions-list'),
      { target: { value: '' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(5)
  })

  it('should open function details', () => {
    (triggeredFunctionsFunctionsSelector as jest.Mock).mockReturnValueOnce({
      data: mockedFunctions,
      loading: false
    })
    render(<FunctionsPage />)

    fireEvent.click(screen.getByTestId('row-foo1'))

    expect(screen.getByTestId('function-details-foo1')).toBeInTheDocument()
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    await act(() => {
      render(<FunctionsPage />)
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTIONS_RECEIVED,
      eventData: {
        databaseId: 'instanceId',
        functions: {
          cluster_functions: 1,
          functions: 2,
          keyspace_triggers: 1,
          stream_triggers: 1,
          total: 5
        }
      }
    })
  })
})
