/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep } from 'lodash'
import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import { NotificationsDto } from 'apiSrc/modules/notification/dto'
import { NotificationEvent } from 'uiSrc/constants/notifications'
import { setNewNotificationReceived } from 'uiSrc/slices/app/notifications'
import { setIsConnected } from 'uiSrc/slices/app/socket-connection'
import { NotificationType } from 'uiSrc/slices/interfaces'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { SocketEvent } from 'uiSrc/constants'

import CommonAppSubscription from './CommonAppSubscription'

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

describe('CommonAppSubscription', () => {
  it('should render', () => {
    expect(render(<CommonAppSubscription />)).toBeTruthy()
  })

  it('should connect socket', () => {
    const { unmount } = render(<CommonAppSubscription />)

    socket.socketClient.emit(SocketEvent.Connect)

    const afterRenderActions = [
      setIsConnected(true)
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it('should set notifications', () => {
    const { unmount } = render(<CommonAppSubscription />)

    const mockData: NotificationsDto = {
      notifications: [
        {
          type: NotificationType.Global,
          timestamp: 123123125,
          title: 'string',
          body: 'string',
          read: false,
        },
      ],
      totalUnread: 1
    }

    socket.on(NotificationEvent.Notification, (data: NotificationsDto) => {
      expect(data).toEqual(mockData)
    })

    socket.socketClient.emit(NotificationEvent.Notification, mockData)

    const afterRenderActions = [
      setNewNotificationReceived(mockData as NotificationsDto)
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })
})
