import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, fireEvent, screen } from 'uiSrc/utils/test-utils'

import { loadList } from 'uiSrc/slices/browser/redisearch'
import { changeSQActiveRunQueryMode } from 'uiSrc/slices/search/searchAndQuery'
import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import QueryWrapper from './QueryWrapper'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
    db: 0,
  }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSearchAndQuery: jest.fn().mockReturnValue({
    script: 'value'
  })
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

describe('Query', () => {
  it('should render', () => {
    expect(render(<QueryWrapper onSubmit={jest.fn()} />)).toBeTruthy()
  })

  it('should fetch list of indexes', () => {
    render(<QueryWrapper onSubmit={jest.fn()} />)

    expect(store.getActions()).toEqual([loadList()])
  })

  it('should call proper actions after change mode', () => {
    render(<QueryWrapper onSubmit={jest.fn()} />)

    fireEvent.click(screen.getByTestId('btn-change-mode'))

    expect(store.getActions()).toEqual([loadList(), changeSQActiveRunQueryMode(RunQueryMode.Raw)])
  })

  it('should call proper actions after submit', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const onSubmit = jest.fn()
    render(<QueryWrapper onSubmit={onSubmit} />)

    fireEvent.click(screen.getByTestId('btn-submit'))

    expect(onSubmit).toBeCalledWith('value', undefined, { mode: RunQueryMode.ASCII })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
      eventData: {
        databaseId: 'instanceId',
        mode: RunQueryMode.ASCII,
        command: 'value'
      }
    })
  })
})
