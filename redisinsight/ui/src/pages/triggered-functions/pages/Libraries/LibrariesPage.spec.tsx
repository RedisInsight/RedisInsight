import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import {
  getTriggeredFunctionsLibrariesList,
  triggeredFunctionsLibrariesSelector,
  triggeredFunctionsAddLibrarySelector,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { TRIGGERED_FUNCTIONS_LIBRARIES_LIST_MOCKED_DATA } from 'uiSrc/mocks/data/triggeredFunctions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import LibrariesPage from './LibrariesPage'

jest.mock('uiSrc/slices/triggeredFunctions/triggeredFunctions', () => ({
  ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions'),
  triggeredFunctionsLibrariesSelector: jest.fn().mockReturnValue({
    loading: false,
    data: null
  }),
  triggeredFunctionsAddLibrarySelector: jest.fn().mockReturnValue({
    open: false,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    modules: [{ name: 'redisgears' }]
  }),
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

  it('should not fetch list of libraries if there are no triggers and functions module', () => {
    (connectedInstanceSelector as jest.Mock).mockReturnValueOnce({
      modules: [{ name: 'custom' }],
    })

    render(<LibrariesPage />)

    expect(store.getActions()).toEqual([])
  })

  it('should render message when no libraries uploaded', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: [],
      loading: false
    })
    render(<LibrariesPage />)

    expect(screen.getByTestId('no-libraries-component')).toBeInTheDocument()
  })

  it('should render libraries list', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: mockedLibraries,
      loading: false
    })

    render(<LibrariesPage />)

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

  it('should open library add form and sent proper telemetry event', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<LibrariesPage />)

    fireEvent.click(screen.getByTestId('btn-add-library'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LOAD_LIBRARY_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        tab: 'libraries',
      }
    })
  })

  it('should open details', async () => {
    (triggeredFunctionsAddLibrarySelector as jest.Mock).mockReturnValueOnce({
      open: true,
    })

    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<LibrariesPage />)

    expect(screen.getByTestId('lib-add-form')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('code-value'), { target: { value: 'code' } })

    await act(() => {
      fireEvent.click(screen.getByTestId('add-library-btn-submit'))
    })

    // Library is default name when can not parse real name from code
    expect(screen.getByTestId('lib-details-Library')).toBeInTheDocument()
  })

  it('should sent proper telemetry event on close add library form', () => {
    (triggeredFunctionsAddLibrarySelector as jest.Mock).mockReturnValueOnce({
      open: true,
      loading: false
    })

    render(<LibrariesPage />)

    fireEvent.click(screen.getByTestId('close-add-form-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LOAD_LIBRARY_CANCELLED,
      eventData: {
        databaseId: 'instanceId',
      }
    })
  })

  it('should close library details', async () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: mockedLibraries,
      loading: false
    })
    render(<LibrariesPage />)

    fireEvent.click(screen.getByTestId('row-lib1'))

    expect(screen.getByTestId('lib-details-lib1')).toBeInTheDocument()

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-library-icon-lib1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-library-lib1'))
    })

    expect(screen.queryByTestId('lib-details-lib1')).not.toBeInTheDocument()
  })

  it('should not render libraries list', () => {
    (triggeredFunctionsLibrariesSelector as jest.Mock).mockReturnValueOnce({
      data: null,
      loading: false
    })
    const { queryByTestId } = render(<LibrariesPage />)

    expect(queryByTestId('total-libraries')).not.toBeInTheDocument()
  })
})
