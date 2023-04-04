import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io, Socket } from 'socket.io-client'

import { remove } from 'lodash'
import { SocketEvent } from 'uiSrc/constants'
import { NotificationEvent } from 'uiSrc/constants/notifications'
import { setNewNotificationAction } from 'uiSrc/slices/app/notifications'
import { setIsConnected } from 'uiSrc/slices/app/socket-connection'
import { getBaseApiUrl, Nullable } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { setTotalUnread } from 'uiSrc/slices/recommendations/recommendations'
import { RecommendationsSocketEvents } from 'uiSrc/constants/recommendations'

const CommonAppSubscription = () => {
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const [recommendationsSubscriptions, setRecommendationsSubscriptions] = useState<string[]>([])
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
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      unSubscribeFromAllRecommendations()
    })
  }, [])

  useEffect(() => {
    if (!instanceId) return

    unSubscribeFromAllRecommendations()
    setRecommendationsSubscriptions((ids) => [...ids, instanceId])

    socketRef.current?.on(`${RecommendationsSocketEvents.Recommendation}:${instanceId}`, (data) => {
      dispatch(setTotalUnread(data.totalUnread))
    })
  }, [instanceId])

  const unSubscribeFromAllRecommendations = () => {
    recommendationsSubscriptions.forEach((id) => {
      const subscription = `${RecommendationsSocketEvents.Recommendation}:${id}`
      const isListenerExist = !!socketRef.current?.listeners(subscription).length

      if (isListenerExist) {
        setRecommendationsSubscriptions((ids) => remove(ids, id))
        socketRef.current?.removeListener(subscription)
      }
    })
  }

  return null
}

export default CommonAppSubscription
