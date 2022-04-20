/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep } from 'lodash'
import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import {
  monitorSelector,
  setMonitorLoadingPause,
  pauseMonitor,
  setSocket,
  stopMonitor,
  lockResume
} from 'uiSrc/slices/cli/monitor'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { MonitorEvent, SocketEvent } from 'uiSrc/constants'
import MonitorConfig from './MonitorConfig'

let store: typeof mockedStore
let socket: typeof MockedSocket
beforeEach(() => {
  cleanup()
  socket = new MockedSocket()
  socketIO.mockReturnValue(socket)
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('socket.io-client')

jest.mock('uiSrc/slices/cli/monitor', () => ({
  ...jest.requireActual('uiSrc/slices/cli/monitor'),
  monitorSelector: jest.fn().mockReturnValue({
    isRunning: false,
    isMinimizedMonitor: false,
    isShowMonitor: true,
  }),
}))

jest.mock('uiSrc/slices/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1'
  }),
}))

describe('MonitorConfig', () => {
  it('should render', () => {
    expect(render(<MonitorConfig />)).toBeTruthy()
  })

  it('socket should be set to store', () => {
    render(<MonitorConfig />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    const { unmount } = render(<MonitorConfig />)
    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true)
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it(`should emit ${MonitorEvent.Monitor} event`, () => {
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    const { unmount } = render(<MonitorConfig />)

    socket.on(MonitorEvent.MonitorData, (data: []) => {
      expect(data).toEqual(['message1', 'message2'])
    })

    socket.socketClient.emit(MonitorEvent.MonitorData, ['message1', 'message2'])

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true)
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it('monitor should catch Exception', () => {
    const { unmount } = render(<MonitorConfig />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    socket.on(MonitorEvent.Exception, (error: Error) => {
      expect(error).toEqual({ message: 'test', name: 'error' })
      // done()
    })

    socket.socketClient.emit(MonitorEvent.Exception, { message: 'test', name: 'error' })

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true),
      pauseMonitor()
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it('monitor should catch connect_error', () => {
    const { unmount } = render(<MonitorConfig />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    socket.on(SocketEvent.ConnectionError, (error: Error) => {
      expect(error).toEqual({ message: 'test', name: 'error' })
    })

    socket.socketClient.emit(SocketEvent.ConnectionError, { message: 'test', name: 'error' })

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true)
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it('monitor should catch disconnect', () => {
    const { unmount } = render(<MonitorConfig retryDelay={0} />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    socket.socketClient.emit(SocketEvent.Disconnect)

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true),
      pauseMonitor(),
      stopMonitor(),
      lockResume()
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })
})
