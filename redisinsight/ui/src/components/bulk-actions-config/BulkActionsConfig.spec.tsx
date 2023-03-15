/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep } from 'lodash'
import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { BulkActionsServerEvent, BulkActionsType, SocketEvent } from 'uiSrc/constants'
import {
  bulkActionsSelector,
  disconnectBulkAction,
  setBulkActionConnected,
  setLoading
} from 'uiSrc/slices/browser/bulkActions'
import BulkActionsConfig from './BulkActionsConfig'

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

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  bulkActionsSelector: jest.fn().mockReturnValue({
    isConnected: false,
    isActionTriggered: false
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1'
  }),
}))

const deletingMock = [{
  id: '123',
  databaseId: '1',
  db: 1,
  type: BulkActionsType.Delete,
  filter: {
    type: null,
    match: '*',
  }
}]

describe('BulkActionsConfig', () => {
  it('should render', () => {
    expect(render(<BulkActionsConfig />)).toBeTruthy()
  })

  it('should connect socket', () => {
    const bulkActionsSelectorMock = jest.fn().mockReturnValue({
      isActionTriggered: true,
    })
    bulkActionsSelector.mockImplementation(bulkActionsSelectorMock)

    render(<BulkActionsConfig />)

    socket.socketClient.emit(SocketEvent.Connect)

    const afterRenderActions = [
      setBulkActionConnected(true),
      setLoading(true)
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
  })

  it('should emit Create a delete type', () => {
    const bulkActionsSelectorMock = jest.fn().mockReturnValue({
      isActionTriggered: true,
    })
    bulkActionsSelector.mockImplementation(bulkActionsSelectorMock)

    render(<BulkActionsConfig />)

    socket.on(BulkActionsServerEvent.Create, (data: any) => {
      expect(data).toEqual(deletingMock)
    })

    socket.socketClient.emit(SocketEvent.Connect)
    socket.socketClient.emit(BulkActionsServerEvent.Create, deletingMock)
  })

  it('should catch disconnect', () => {
    const bulkActionsSelectorMock = jest.fn().mockReturnValue({
      isActionTriggered: true,
      isConnected: true,
    })
    bulkActionsSelector.mockImplementation(bulkActionsSelectorMock)

    const { unmount } = render(<BulkActionsConfig retryDelay={0} />)

    socket.socketClient.emit(SocketEvent.Connect)
    socket.socketClient.emit(SocketEvent.Disconnect)

    const afterRenderActions = [
      setBulkActionConnected(true),
      setLoading(true),
      disconnectBulkAction(),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })
})
