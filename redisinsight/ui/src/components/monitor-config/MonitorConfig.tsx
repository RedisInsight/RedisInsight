import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { io } from 'socket.io-client'

import {
  setSocket,
  monitorSelector,
  toggleRunMonitor,
  concatMonitorItems,
  stopMonitor,
  setError,
  resetMonitorItems
} from 'uiSrc/slices/cli/monitor'
import { getBaseApiUrl } from 'uiSrc/utils'
import { MonitorErrorMessages, MonitorEvent, SocketErrors, SocketEvent } from 'uiSrc/constants'
import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { IOnDatePayload } from 'apiSrc/modules/monitor/helpers/client-monitor-observer'

import ApiStatusCode from '../../constants/apiStatusCode'

interface IProps {
  retryDelay?: number;
}
const MonitorConfig = ({ retryDelay = 10000 } : IProps) => {
  const { id: instanceId = '' } = useSelector(connectedInstanceSelector)
  const { socket, isRunning, isMinimizedMonitor, isShowMonitor } = useSelector(monitorSelector)

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
    })
    dispatch(setSocket(newSocket))
    let payloads: IMonitorDataPayload[] = []

    const handleMonitorEvents = () => {
      newSocket.on(MonitorEvent.MonitorData, (payload:IOnDatePayload[]) => {
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
      newSocket.emit(MonitorEvent.Monitor, handleMonitorEvents)
    })

    // Catch exceptions
    newSocket.on(MonitorEvent.Exception, (payload) => {
      if (payload.status === ApiStatusCode.NoPermission) {
        handleDisconnect()
        dispatch(setError(MonitorErrorMessages.NoPerm))
        dispatch(resetMonitorItems())
        return
      }

      payloads.push({ isError: true, time: `${Date.now()}`, ...payload })
      setNewItems(payloads, () => { payloads.length = 0 })
      dispatch(toggleRunMonitor())
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
      dispatch(toggleRunMonitor())
    })
  }, [instanceId, isRunning])

  useEffect(() => {
    if (!isRunning) {
      socket?.removeAllListeners()
      socket?.disconnect()
    }
  }, [socket, isRunning, isShowMonitor, isMinimizedMonitor])

  return null
}

export default MonitorConfig
