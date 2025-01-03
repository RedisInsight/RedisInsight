import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Socket } from 'socket.io-client'

import { CloudJobEvents, SocketEvent, SocketFeaturesEvent } from 'uiSrc/constants'
import { NotificationEvent } from 'uiSrc/constants/notifications'
import { setNewNotificationAction } from 'uiSrc/slices/app/notifications'
import { setIsConnected } from 'uiSrc/slices/app/socket-connection'
import { getSocketApiUrl, Nullable } from 'uiSrc/utils'
import { getFeatureFlagsSuccess } from 'uiSrc/slices/app/features'
import { oauthCloudJobSelector, setJob } from 'uiSrc/slices/oauth/cloud'
import { CloudJobName } from 'uiSrc/electron/constants'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'
import { CloudJobInfo } from 'apiSrc/modules/cloud/job/models'

const CommonAppSubscription = () => {
  const { id: jobId = '' } = useSelector(oauthCloudJobSelector) ?? {}
  const { token } = useSelector(appCsrfSelector)
  const socketRef = useRef<Nullable<Socket>>(null)

  const socketParams = useMemo(() => ({
    forceNew: false,
    token,
    reconnection: true,
  }), [token])
  const connectIo = useIoConnection(getSocketApiUrl(), socketParams)

  const dispatch = useDispatch()

  useEffect(() => {
    if (socketRef.current?.connected) {
      return
    }

    socketRef.current = connectIo()

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

    emitCloudJobMonitor(jobId)
  }, [])

  useEffect(() => {
    emitCloudJobMonitor(jobId)
  }, [jobId])

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
