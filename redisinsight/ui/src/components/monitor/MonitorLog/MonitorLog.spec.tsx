import { cloneDeep } from 'lodash'
import React from 'react'
import { saveAs } from 'file-saver'
import { monitorSelector, resetProfiler, stopMonitor } from 'uiSrc/slices/cli/monitor'
import { act, cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import MonitorLog from './MonitorLog'

let store: typeof mockedStore
let URLMock: jest.SpyInstance<object>
const mockURLrevokeObjectURL = 123123

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}))

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

global.Blob = function (content, options) { return ({ content, options }) }
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

  it('should call download a file', async () => {
    const saveAsMock = jest.fn()
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

    (monitorSelector as jest.Mock).mockImplementation(monitorSelectorMock);
    (saveAs as jest.Mock).mockImplementation(() => saveAsMock)

    render(<MonitorLog />)

    await act(() => {
      fireEvent.click(screen.getByTestId('download-log-btn'))
    })

    expect(saveAs).toBeCalledWith(
      { content: ['123'], options: { type: 'text/plain;charset=utf-8' } },
      'filename.txt',
    )
    saveAs.mockRestore()
  })
})
