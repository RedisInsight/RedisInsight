import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io, Socket } from 'socket.io-client'

import {
  setLoading,
  bulkActionsSelector,
  disconnectBulkAction,
  setBulkActionConnected,
  setOverview,
  setBulkActionsInitialState,
} from 'uiSrc/slices/browser/bulkActions'
import { getBaseApiUrl, Nullable } from 'uiSrc/utils'
import { sessionStorageService } from 'uiSrc/services'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { isProcessingBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import { BrowserStorageItem, BulkActionsServerEvent, BulkActionsStatus, BulkActionsType, SocketEvent } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

interface IProps {
  retryDelay?: number;
}

const BulkActionsConfig = ({ retryDelay = 5000 } : IProps) => {
  const { id: instanceId = '', db } = useSelector(connectedInstanceSelector)
  const { isActionTriggered, isConnected } = useSelector(bulkActionsSelector)
  const { filter, search } = useSelector(keysSelector)
  const socketRef = useRef<Nullable<Socket>>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isActionTriggered || !instanceId || socketRef.current?.connected) {
      return
    }

    let retryTimer: NodeJS.Timer

    socketRef.current = io(`${getBaseApiUrl()}/bulk-actions`, {
      forceNew: true,
      query: { instanceId },
      rejectUnauthorized: false,
    })

    socketRef.current.on(SocketEvent.Connect, () => {
      clearTimeout(retryTimer)
      dispatch(setBulkActionConnected(true))

      emitBulkDelete(`${Date.now()}`)
    })

    // Catch connect error
    socketRef.current?.on(SocketEvent.ConnectionError, () => {})

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      if (retryDelay) {
        retryTimer = setTimeout(handleDisconnect, retryDelay)
      } else {
        handleDisconnect()
      }
    })
  }, [instanceId, isActionTriggered])

  useEffect(() => {
    if (!socketRef.current?.connected) {
      return
    }
    const id = sessionStorageService.get(BrowserStorageItem.bulkActionId) ?? ''

    if (!isActionTriggered) {
      abortBulkDelete(id)
      return
    }

    emitBulkDelete(id)
  }, [isActionTriggered])

  const emitBulkDelete = (id: string) => {
    dispatch(setLoading(true))
    sessionStorageService.set(BrowserStorageItem.bulkActionId, id)

    socketRef.current?.emit(
      BulkActionsServerEvent.Create,
      {
        id,
        databaseId: instanceId,
        db: db || 0,
        type: BulkActionsType.Delete,
        filter: {
          type: filter,
          match: search || '*',
        }
      },
      onBulkDeleting,
    )
  }

  const getBulkAction = (id: string) => {
    dispatch(setLoading(true))
    socketRef.current?.emit(
      BulkActionsServerEvent.Get,
      { id: `${id}` },
      fetchBulkAction
    )
  }

  const abortBulkDelete = (id: string) => {
    dispatch(setLoading(true))
    socketRef.current?.emit(
      BulkActionsServerEvent.Abort,
      { id: `${id}` },
      onBulkDeleteAborted
    )
  }

  const fetchBulkAction = (data: any) => {
    if (data.status === BulkActionsServerEvent.Error) {
      sessionStorageService.set(BrowserStorageItem.bulkActionId, '')
      dispatch(setBulkActionsInitialState())
    }
  }

  const onBulkDeleting = (data: any) => {
    if (data.status === BulkActionsServerEvent.Error) {
      dispatch(disconnectBulkAction())
      dispatch(addErrorNotification({ response: { data: data.error } }))
    }

    socketRef.current?.on(BulkActionsServerEvent.Overview, (payload: any) => {
      dispatch(setLoading(isProcessingBulkAction(payload.status)))
      dispatch(setOverview(payload))

      if (payload.status === BulkActionsStatus.Failed) {
        dispatch(disconnectBulkAction())
      }
    })
  }

  const onBulkDeleteAborted = (data: any) => {
    dispatch(setLoading(false))
    sessionStorageService.set(BrowserStorageItem.bulkActionId, '')

    if (data.status === 'aborted') {
      dispatch(setOverview(data))
    }
  }

  useEffect(() => {
    if (!isConnected && socketRef.current?.connected) {
      handleDisconnect()
    }
  }, [isConnected])

  const handleDisconnect = () => {
    dispatch(disconnectBulkAction())
    socketRef.current?.removeAllListeners()
    socketRef.current?.disconnect()
  }

  return null
}

export default BulkActionsConfig
