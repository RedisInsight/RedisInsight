import { cloneDeep } from 'lodash'
import React from 'react'
import { monitorSelector, resetProfiler, stopMonitor } from 'uiSrc/slices/cli/monitor'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import MonitorLog from './MonitorLog'

let store: typeof mockedStore
let URLMock: jest.SpyInstance<object>
const mockURLrevokeObjectURL = 123123

jest.mock('uiSrc/slices/cli/monitor', () => ({
  ...jest.requireActual('uiSrc/slices/cli/monitor'),
  monitorSelector: jest.fn().mockReturnValue({
    isSaveToFile: false,
    logFileId: 'logFileId',
    timestamp: {
      start: 1,
      paused: 2,
      unPaused: 3,
      duration: 123,
    }
  }),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('123'),
    headers: {
      get: () => '123"filename.txt"oeu',
    }
  }))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  fetch.mockClear()
})

describe('MonitorLog', () => {
  beforeAll(() => {
    URLMock = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => mockURLrevokeObjectURL)
  })

  it('should render', () => {
    expect(render(<MonitorLog />)).toBeTruthy()
  })

  it('should call proper actions on click reset profiler', () => {
    render(<MonitorLog />)
    fireEvent.click(screen.getByTestId('reset-profiler-btn'))

    const expectedActions = [stopMonitor(), resetProfiler()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it.skip('should call download a file', () => {
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isSaveToFile: true,
      logFileId: 'logFileId',
      timestamp: {
        start: 1,
        paused: 2,
        unPaused: 3,
        duration: 123,
      }
    });
    (monitorSelector as jest.Mock).mockImplementation(monitorSelectorMock)

    render(<MonitorLog />)
    fireEvent.click(screen.getByTestId('download-log-btn'))

    expect(URLMock).toBeCalled()
  })
})
