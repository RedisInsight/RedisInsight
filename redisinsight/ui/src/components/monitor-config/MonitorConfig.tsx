import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { io } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

import {
  setSocket,
  monitorSelector,
  concatMonitorItems,
  stopMonitor,
  setError,
  resetMonitorItems,
  setStartTimestamp,
  setMonitorLoadingPause,
  setLogFileId,
  pauseMonitor, lockResume
} from 'uiSrc/slices/cli/monitor'
import { getBaseApiUrl } from 'uiSrc/utils'
import { MonitorErrorMessages, MonitorEvent, SocketErrors, SocketEvent } from 'uiSrc/constants'
import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { CustomHeaders } from 'uiSrc/constants/api'
import { IMonitorData } from 'apiSrc/modules/profiler/interfaces/monitor-data.interface'

import ApiStatusCode from '../../constants/apiStatusCode'

interface IProps {
  retryDelay?: number;
}
const MonitorConfig = ({ retryDelay = 15000 } : IProps) => {
  const { id: instanceId = '' } = useSelector(connectedInstanceSelector)
  const { socket, isRunning, isPaused, isSaveToFile, isMinimizedMonitor, isShowMonitor } = useSelector(monitorSelector)

  const dispatch = useDispatch()

  const setNewItems = debounce((items, onSuccess?) => {
    dispatch(concatMonitorItems(items))
    onSuccess?.()
  }, 50, {
    maxWait: 150,
  })

  const getErrorMessage = (error: { type: string; name: any; message: any }): string => {
    if (error?.type === SocketErrors.TransportError) {
      return MonitorErrorMessages.LostConnection
    }
    return error?.name || error?.message
  }

  useEffect(() => {
    if (!isRunning || !instanceId || socket?.connected) {
      return
    }
    const logFileId = `_redis_${uuidv4()}`
    const timestamp = Date.now()
    let retryTimer: NodeJS.Timer

    // Create SocketIO connection to instance by instanceId
    const newSocket = io(`${getBaseApiUrl()}/monitor`, {
      forceNew: true,
      query: { instanceId },
      extraHeaders: { [CustomHeaders.WindowId]: window.windowId || '' },
      rejectUnauthorized: false,
    })
    dispatch(setSocket(newSocket))
    let payloads: IMonitorDataPayload[] = []

    const handleMonitorEvents = () => {
      dispatch(setMonitorLoadingPause(false))
      newSocket.on(MonitorEvent.MonitorData, (payload: IMonitorData[]) => {
        payloads = payloads.concat(payload)

        // set batch of payloads and then clear batch
        setNewItems(payloads, () => {
          payloads.length = 0
          // reset all timings after items were changed
          setNewItems.cancel()
        })
      })
    }

    const handleDisconnect = () => {
      newSocket.removeAllListeners()
      dispatch(pauseMonitor())
      dispatch(stopMonitor())
      dispatch(lockResume())
    }

    newSocket.on(SocketEvent.Connect, () => {
      // Trigger Monitor event
      clearTimeout(retryTimer)

      dispatch(setLogFileId(logFileId))
      dispatch(setStartTimestamp(timestamp))
      newSocket.emit(
        MonitorEvent.Monitor,
        { logFileId: isSaveToFile ? logFileId : null },
        handleMonitorEvents
      )
    })

    // Catch exceptions
    newSocket.on(MonitorEvent.Exception, (payload) => {
      if (payload.status === ApiStatusCode.Forbidden) {
        handleDisconnect()
        dispatch(setError(MonitorErrorMessages.NoPerm))
        dispatch(resetMonitorItems())
        return
      }

      payloads.push({ isError: true, time: `${Date.now()}`, ...payload })
      setNewItems(payloads, () => { payloads.length = 0 })
      dispatch(pauseMonitor())
    })

    // Catch disconnect
    newSocket.on(SocketEvent.Disconnect, () => {
      if (retryDelay) {
        retryTimer = setTimeout(handleDisconnect, retryDelay)
      } else {
        handleDisconnect()
      }
    })

    // Catch connect error
    newSocket.on(SocketEvent.ConnectionError, (error) => {
      payloads.push({ isError: true, time: `${Date.now()}`, message: getErrorMessage(error) })
      setNewItems(payloads, () => { payloads.length = 0 })
    })
  }, [instanceId, isRunning, isSaveToFile])

  useEffect(() => {
    if (!isRunning) return

    const pauseUnpause = async () => {
      !isPaused && await new Promise<void>((resolve) => socket?.emit(MonitorEvent.Monitor, () => resolve()))
      isPaused && await new Promise<void>((resolve) => socket?.emit(MonitorEvent.Pause, () => resolve()))
      dispatch(setMonitorLoadingPause(false))
    }
    dispatch(setMonitorLoadingPause(true))
    pauseUnpause().catch(console.error)
  }, [isPaused, isRunning])

  useEffect(() => {
    if (!isRunning) {
      socket?.emit(MonitorEvent.FlushLogs)
      socket?.removeAllListeners()
      socket?.disconnect()
    }
  }, [socket, isRunning, isShowMonitor, isMinimizedMonitor])

  return null
}

export default MonitorConfig
