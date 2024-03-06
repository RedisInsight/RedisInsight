import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { cleanup, mockedStore, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import {
  getTriggeredFunctionsLibraryDetails,
  setSelectedFunctionToShow,
  triggeredFunctionsSelectedLibrarySelector
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {
  TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA
} from 'uiSrc/mocks/data/triggeredFunctions'
import { FunctionType } from 'uiSrc/slices/interfaces/triggeredFunctions'
import LibraryDetails from './LibraryDetails'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/triggeredFunctions/triggeredFunctions', () => ({
  ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions'),
  triggeredFunctionsSelectedLibrarySelector: jest.fn().mockReturnValue({
    ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions').triggeredFunctionsSelectedLibrarySelector
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedLibrary = TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA

describe('LibraryDetails', () => {
  it('should render', () => {
    expect(render(<LibraryDetails name="lib" onClose={jest.fn()} />)).toBeTruthy()
  })

  it('should call fetch details on render', () => {
    render(<LibraryDetails name="lib" onClose={jest.fn()} />)

    const expectedActions = [getTriggeredFunctionsLibraryDetails()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call onCLose', () => {
    const onClose = jest.fn()
    render(<LibraryDetails name="lib" onClose={onClose} />)

    fireEvent.click(screen.getByTestId('close-right-panel-btn'))
    expect(onClose).toBeCalled()
  })

  it('should render proper content', async () => {
    (triggeredFunctionsSelectedLibrarySelector as jest.Mock).mockReturnValueOnce({
      lastRefresh: null,
      loading: false,
      data: mockedLibrary
    })

    render(<LibraryDetails name="lib" onClose={jest.fn()} />)

    expect(screen.getByTestId('lib-name')).toHaveTextContent('lib')
    expect(screen.getByTestId('lib-apiVersion')).toHaveTextContent('1.2')
    expect(screen.getByTestId('functions-Functions')).toHaveTextContent('Functions (2)foofoo1')
    expect(screen.getByTestId('functions-Keyspace triggers')).toHaveTextContent('Keyspace triggers (1)foo3')
    expect(screen.getByTestId('functions-Cluster Functions')).toHaveTextContent('Cluster Functions (1)foo2')
    expect(screen.getByTestId('functions-Stream Functions')).toHaveTextContent('Stream Functions Empty')

    expect(screen.getByTestId('library-code')).toHaveValue('code')

    fireEvent.click(screen.getByTestId('library-view-tab-config'))
    expect(screen.getByTestId('library-configuration')).toHaveValue('config')
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    await act(() => {
      render(<LibraryDetails name="lib" onClose={jest.fn()} />)
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_VIEWED,
      eventData: {
        databaseId: 'instanceId',
        apiVersion: TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA.apiVersion,
        pendingJobs: TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA.pendingJobs,
        configLoaded: true,
        functions: {
          cluster_functions: 1,
          functions: 2,
          keyspace_triggers: 1,
          stream_triggers: 0,
          total: 4
        }
      }
    })

    fireEvent.click(screen.getByTestId('lib-details-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DETAILS_REFRESH_CLICKED,
      eventData: {
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()

    fireEvent.click(screen.getByTestId('lib-details-auto-refresh-config-btn'))
    fireEvent.click(screen.getByTestId('lib-details-auto-refresh-switch'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DETAILS_AUTO_REFRESH_ENABLED,
      eventData: {
        refreshRate: '5.0',
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()
    fireEvent.click(screen.getByTestId('lib-details-auto-refresh-switch'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DETAILS_AUTO_REFRESH_DISABLED,
      eventData: {
        refreshRate: '5.0',
        databaseId: 'instanceId'
      }
    })
  })

  it('should call proper actions and history to move to the library', () => {
    (triggeredFunctionsSelectedLibrarySelector as jest.Mock).mockReturnValueOnce({
      lastRefresh: null,
      loading: false,
      data: mockedLibrary
    })

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<LibraryDetails name="lib" onClose={jest.fn()} />)

    fireEvent.click(screen.getByTestId('moveToFunction-foo'))

    const expectedActions = [getTriggeredFunctionsLibraryDetails(), setSelectedFunctionToShow({
      library: 'lib',
      name: 'foo',
      type: 'functions' as FunctionType
    })]
    expect(store.getActions()).toEqual(expectedActions)

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/triggered-functions/functions')
  })
})
