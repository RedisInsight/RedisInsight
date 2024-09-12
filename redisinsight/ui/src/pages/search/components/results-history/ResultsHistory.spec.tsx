import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import {
  clearWbResults,
  loadWBHistory,
  processWBCommand,
  workbenchResultsSelector
} from 'uiSrc/slices/workbench/wb-results'
import ResultsHistory from './ResultsHistory'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/workbench/wb-results', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-results'),
  workbenchResultsSelector: jest.fn().mockReturnValue({
    loading: false,
    items: []
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ResultsHistory', () => {
  it('should render', () => {
    expect(render(<ResultsHistory onSubmit={jest.fn()} />)).toBeTruthy()
  })

  it('should call proper actions on rerun', async () => {
    const onSubmit = jest.fn()
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (workbenchResultsSelector as jest.Mock).mockReturnValue({
      items: [
        {
          mode: 'RAW',
          resultsMode: 'DEFAULT',
          id: '9dda0f6d-9265-4b15-b627-82d2eb867605',
          databaseId: '18c37d1d-bc25-4e46-a20d-a1f9bf228946',
          command: 'info',
          summary: null,
          createdAt: '2022-09-28T18:04:46.000Z',
          emptyCommand: false
        }
      ]
    })

    render(<ResultsHistory commandsArray={['INFO']} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByTestId('re-run-command'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
      eventData: {
        command: 'INFO',
        databaseId: INSTANCE_ID_MOCK,
        mode: 'RAW'
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()

    expect(onSubmit).toBeCalledWith(
      'info',
      '9dda0f6d-9265-4b15-b627-82d2eb867605',
      { mode: 'RAW' }
    )
  })

  it('should call proper actions on delete', async () => {
    const onSubmit = jest.fn()
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (workbenchResultsSelector as jest.Mock).mockReturnValue({
      items: [
        {
          mode: 'RAW',
          resultsMode: 'DEFAULT',
          id: '9dda0f6d-9265-4b15-b627-82d2eb867605',
          databaseId: '18c37d1d-bc25-4e46-a20d-a1f9bf228946',
          command: 'info',
          summary: null,
          createdAt: '2022-09-28T18:04:46.000Z',
          emptyCommand: false
        }
      ]
    })

    render(<ResultsHistory commandsArray={['INFO']} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByTestId('delete-command'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SEARCH_CLEAR_RESULT_CLICKED,
      eventData: {
        command: 'info',
        databaseId: INSTANCE_ID_MOCK,
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()

    expect(store.getActions()).toEqual([
      loadWBHistory(),
      processWBCommand('9dda0f6d-9265-4b15-b627-82d2eb867605')
    ])
  })

  it('should call proper actions on clear all commands', async () => {
    const onSubmit = jest.fn()
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (workbenchResultsSelector as jest.Mock).mockReturnValue({
      items: [
        {
          mode: 'RAW',
          resultsMode: 'DEFAULT',
          id: '9dda0f6d-9265-4b15-b627-82d2eb867605',
          databaseId: '18c37d1d-bc25-4e46-a20d-a1f9bf228946',
          command: 'info',
          summary: null,
          createdAt: '2022-09-28T18:04:46.000Z',
          emptyCommand: false
        }
      ]
    })

    render(<ResultsHistory commandsArray={['INFO']} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByTestId('clear-history-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()

    expect(store.getActions()).toEqual([
      loadWBHistory(),
      clearWbResults()
    ])
  })
})
