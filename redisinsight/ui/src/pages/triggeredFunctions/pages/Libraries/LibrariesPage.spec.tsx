import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import {
  getTriggeredFunctionsLibrariesList,
  triggeredFunctionsLibrariesSelector,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { TRIGGERED_FUNCTIONS_LIBRARIES_LIST_MOCKED_DATA } from 'uiSrc/mocks/data/triggeredFunctions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import LibrariesPage from './LibrariesPage'

jest.mock('uiSrc/slices/triggeredFunctions/triggeredFunctions', () => ({
  ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions'),
  triggeredFunctionsLibrariesSelector: jest.fn().mockReturnValue({
    loading: false,
    data: null
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedLibraries = TRIGGERED_FUNCTIONS_LIBRARIES_LIST_MOCKED_DATA

describe('LibrariesPage', () => {
  it('should render', () => {
    expect(render(<LibrariesPage />)).toBeTruthy()
  })

  it('should fetch list of libraries', () => {
    render(<LibrariesPage />)

    const expectedActions = [getTriggeredFunctionsLibrariesList()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render message when no libraries uploaded', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: [],
      loading: false
    })
    render(<LibrariesPage />)

    expect(screen.getByTestId('triggered-functions-welcome')).toBeInTheDocument()
  })

  it('should render libraries list', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: mockedLibraries,
      loading: false
    })
    render(<LibrariesPage />)

    expect(screen.queryByTestId('triggered-functions-welcome')).not.toBeInTheDocument()
    expect(screen.getByTestId('libraries-list-table')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(3)
  })

  it('should filter libraries list', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: mockedLibraries,
      loading: false
    })
    render(<LibrariesPage />)

    fireEvent.change(
      screen.getByTestId('search-libraries-list'),
      { target: { value: 'lib1' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(1)
    expect(screen.getByTestId('row-lib1')).toBeInTheDocument()

    fireEvent.change(
      screen.getByTestId('search-libraries-list'),
      { target: { value: 'user1' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(2)
    expect(screen.getByTestId('row-lib1')).toBeInTheDocument()
    expect(screen.getByTestId('row-lib2')).toBeInTheDocument()

    fireEvent.change(
      screen.getByTestId('search-libraries-list'),
      { target: { value: '' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(3)
  })

  it('should open library details', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: mockedLibraries,
      loading: false
    })
    render(<LibrariesPage />)

    fireEvent.click(screen.getByTestId('row-lib1'))

    expect(screen.getByTestId('lib-details-lib1')).toBeInTheDocument()
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    await act(() => {
      render(<LibrariesPage />)
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARIES_RECEIVED,
      eventData: {
        databaseId: 'instanceId',
        total: mockedLibraries.length
      }
    })
  })
})
