import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'

import { SocketEvent } from 'uiSrc/constants'
import { NotificationEvent } from 'uiSrc/constants/notifications'
import { setNewNotificationAction } from 'uiSrc/slices/app/notifications'
import { setIsConnected } from 'uiSrc/slices/app/socket-connection'
import { getBaseApiUrl, Nullable } from 'uiSrc/utils'

const CommonAppSubscription = () => {
  const socketRef = useRef<Nullable<Socket>>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (socketRef.current?.connected) {
      return
    }

    socketRef.current = io(`${getBaseApiUrl()}`, {
      forceNew: false,
      rejectUnauthorized: false,
      reconnection: true
    })

    socketRef.current.on(SocketEvent.Connect, () => {
      dispatch(setIsConnected(true))
    })

    socketRef.current.on(NotificationEvent.Notification, (data) => {
      dispatch(setNewNotificationAction(data))
    })

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {})
  }, [])

  return null
}

export default CommonAppSubscription
