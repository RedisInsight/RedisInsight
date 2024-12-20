import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io, Socket } from 'socket.io-client'

import { remove } from 'lodash'
import { CloudJobEvents, RecommendationEvents, SocketEvent, SocketFeaturesEvent } from 'uiSrc/constants'
import { NotificationEvent } from 'uiSrc/constants/notifications'
import { setNewNotificationAction } from 'uiSrc/slices/app/notifications'
import { setIsConnected } from 'uiSrc/slices/app/socket-connection'
import { getBaseApiUrl, Nullable, getProxyPath } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { addUnreadRecommendations } from 'uiSrc/slices/recommendations/recommendations'
import { RecommendationsSocketEvents } from 'uiSrc/constants/recommendations'
import { getFeatureFlagsSuccess } from 'uiSrc/slices/app/features'
import { CustomHeaders } from 'uiSrc/constants/api'
import { oauthCloudJobSelector, setJob } from 'uiSrc/slices/oauth/cloud'
import { CloudJobName } from 'uiSrc/electron/constants'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { getConfig } from 'uiSrc/config'
import { CloudJobInfo } from 'apiSrc/modules/cloud/job/models'

const riConfig = getConfig()

const CommonAppSubscription = () => {
  const { id: jobId = '' } = useSelector(oauthCloudJobSelector) ?? {}
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { token } = useSelector(appCsrfSelector)
  const [recommendationsSubscriptions, setRecommendationsSubscriptions] = useState<string[]>([])
  const socketRef = useRef<Nullable<Socket>>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (socketRef.current?.connected) {
      return
    }

    socketRef.current = io(`${getBaseApiUrl()}`, {
      path: getProxyPath(),
      forceNew: false,
      reconnection: true,
      extraHeaders: {
        [CustomHeaders.WindowId]: window.windowId || '',
        ...(token ? { [CustomHeaders.CsrfToken]: token } : {}),
      },
      rejectUnauthorized: false,
      transports: riConfig.api.socketTransports?.split(','),
      withCredentials: riConfig.api.socketCredentials,
    })

    socketRef.current.on(SocketEvent.Connect, () => {
      dispatch(setIsConnected(true))
    })

    socketRef.current.on(NotificationEvent.Notification, (data) => {
      dispatch(setNewNotificationAction(data))
    })

    socketRef.current.on(SocketFeaturesEvent.Features, (data) => {
      dispatch(getFeatureFlagsSuccess(data))

      // or
      // dispatch(fetchFeatureFlags())
    })

    socketRef.current.on(CloudJobEvents.Monitor, (data: CloudJobInfo) => {
      const jobName = data.name as unknown

      if (
        jobName === CloudJobName.CreateFreeDatabase
        || jobName === CloudJobName.CreateFreeSubscriptionAndDatabase
        || jobName === CloudJobName.ImportFreeDatabase) {
        dispatch(setJob(data))
      }
    })

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      unSubscribeFromAllRecommendations()
    })

    emitCloudJobMonitor(jobId)
  }, [])

  useEffect(() => {
    emitCloudJobMonitor(jobId)
  }, [jobId])

  useEffect(() => {
    if (!instanceId) return

    unSubscribeFromAllRecommendations()
    setRecommendationsSubscriptions((ids) => [...ids, instanceId])

    // subscribe to recommendations for the current instanceId
    socketRef.current?.emit(
      RecommendationEvents.Subscribe,
      { instanceId },
    )

    socketRef.current?.on(`${RecommendationsSocketEvents.Recommendation}:${instanceId}`, (data) => {
      dispatch(addUnreadRecommendations(data))
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

  const emitCloudJobMonitor = (jobId: string) => {
    if (!jobId) return

    socketRef.current?.emit(
      CloudJobEvents.Monitor,
      { jobId },
    )
  }

  return null
}

export default CommonAppSubscription
