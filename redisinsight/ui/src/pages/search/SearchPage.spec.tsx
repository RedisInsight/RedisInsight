import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { loadWBHistory, sendWBCommand } from 'uiSrc/slices/workbench/wb-results'
import { setDbIndexState } from 'uiSrc/slices/app/context'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import SearchPage from './SearchPage'

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSearchAndQuery: jest.fn().mockReturnValue({
    script: 'value',
    panelSizes: { vertical: 100 }
  })
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'db_name',
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
  sendPageViewTelemetry: jest.fn()
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * SearchPage tests
 *
 * @group component
 */
describe('SearchPage', () => {
  it('should render', () => {
    expect(render(<SearchPage />)).toBeTruthy()
  })

  it('should send page event', () => {
    const sendPageViewTelemetryMock = jest.fn();
    (sendPageViewTelemetry as jest.Mock).mockImplementation(() => sendPageViewTelemetryMock)

    render(<SearchPage />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.SEARCH_AND_QUERY_PAGE,
      eventData: {
        databaseId: 'instanceId'
      }
    })
  })

  it('should call proper actions on submit', () => {
    render(<SearchPage />)

    fireEvent.click(screen.getByTestId('btn-submit'))

    expect(store.getActions()).toEqual([
      loadWBHistory(),
      sendWBCommand({
        commandId: expect.any(String),
        commands: ['value']
      }),
      setDbIndexState(true)
    ])
  })
})
