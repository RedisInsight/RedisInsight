import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { io } from 'socket.io-client'

import {
  setSocket,
  monitorSelector,
  concatMonitorItems,
  stopMonitor,
  setError,
  resetMonitorItems,
  setStartTimestamp,
  setLoadingPause
} from 'uiSrc/slices/cli/monitor'
import { getBaseApiUrl } from 'uiSrc/utils'
import { MonitorErrorMessages, MonitorEvent, SocketErrors, SocketEvent } from 'uiSrc/constants'
import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { IMonitorData } from 'apiSrc/modules/profiler/interfaces/monitor-data.interface'

import ApiStatusCode from '../../constants/apiStatusCode'

interface IProps {
  retryDelay?: number;
}
const MonitorConfig = ({ retryDelay = 10000 } : IProps) => {
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
    let retryTimer: NodeJS.Timer

    // Create SocketIO connection to instance by instanceId
    const newSocket = io(`${getBaseApiUrl()}/monitor`, {
      forceNew: true,
      query: { instanceId },
      rejectUnauthorized: false,
    })
    dispatch(setSocket(newSocket))
    let payloads: IMonitorDataPayload[] = []

    const handleMonitorEvents = () => {
      dispatch(setLoadingPause(false))
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
      dispatch(stopMonitor())
    }

    newSocket.on(SocketEvent.Connect, () => {
      // Trigger Monitor event
      clearTimeout(retryTimer)
      const timestampStart = Date.now()
      dispatch(setStartTimestamp(timestampStart))
      newSocket.emit(
        MonitorEvent.Monitor,
        { logFileId: isSaveToFile ? timestampStart.toString() : null },
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
      dispatch(stopMonitor())
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
      dispatch(stopMonitor())
    })
  }, [instanceId, isRunning, isSaveToFile])

  useEffect(() => {
    if (!isRunning) return

    const pauseUnpause = async () => {
      !isPaused && await new Promise<void>((resolve) => { socket?.emit(MonitorEvent.Monitor, () => resolve()) })
      isPaused && await new Promise<void>((resolve) => socket?.emit(MonitorEvent.Pause, () => resolve()))
      dispatch(setLoadingPause(false))
    }
    dispatch(setLoadingPause(true))
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
