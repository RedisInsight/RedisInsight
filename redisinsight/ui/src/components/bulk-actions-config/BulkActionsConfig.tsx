import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Socket } from 'socket.io-client'

import {
  bulkActionsDeleteSelector,
  bulkActionsSelector,
  disconnectBulkDeleteAction,
  setBulkActionConnected,
  setBulkActionsInitialState,
  setBulkDeleteLoading,
  setDeleteOverview,
  setDeleteOverviewStatus,
  setLoading,
} from 'uiSrc/slices/browser/bulkActions'
import { getSocketApiUrl, Nullable } from 'uiSrc/utils'
import { sessionStorageService } from 'uiSrc/services'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { isProcessingBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import {
  BrowserStorageItem,
  BulkActionsServerEvent,
  BulkActionsStatus,
  BulkActionsType,
  SocketEvent,
} from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'

const BulkActionsConfig = () => {
  const { id: instanceId = '', db } = useSelector(connectedInstanceSelector)
  const { isConnected } = useSelector(bulkActionsSelector)
  const { isActionTriggered: isDeleteTriggered } = useSelector(bulkActionsDeleteSelector)
  const { filter, search } = useSelector(keysSelector)
  const { token } = useSelector(appCsrfSelector)
  const socketRef = useRef<Nullable<Socket>>(null)
  const connectIo = useIoConnection(getSocketApiUrl('bulk-actions'), { token, query: { instanceId } })

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isDeleteTriggered || !instanceId || socketRef.current?.connected) {
      return
    }

    let retryTimer: NodeJS.Timer
    socketRef.current = connectIo()

    socketRef.current.on(SocketEvent.Connect, () => {
      clearTimeout(retryTimer)
      dispatch(setBulkActionConnected(true))

      emitBulkDelete(`${Date.now()}`)
    })

    // Catch connect error
    socketRef.current?.on(SocketEvent.ConnectionError, () => {})

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      dispatch(setDeleteOverviewStatus(BulkActionsStatus.Disconnected))
      handleDisconnect()
    })
  }, [instanceId, isDeleteTriggered])

  useEffect(() => {
    if (!socketRef.current?.connected) {
      return
    }
    const id = sessionStorageService.get(BrowserStorageItem.bulkActionDeleteId) ?? ''
    if (!id) return

    if (!isDeleteTriggered) {
      abortBulkDelete(id)
      return
    }

    emitBulkDelete(id)
  }, [isDeleteTriggered])

  const emitBulkDelete = (id: string) => {
    dispatch(setBulkDeleteLoading(true))
    sessionStorageService.set(BrowserStorageItem.bulkActionDeleteId, id)

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
    dispatch(setBulkDeleteLoading(true))
    socketRef.current?.emit(
      BulkActionsServerEvent.Abort,
      { id: `${id}` },
      onBulkDeleteAborted
    )
  }

  const fetchBulkAction = (data: any) => {
    if (data.status === BulkActionsServerEvent.Error) {
      sessionStorageService.set(BrowserStorageItem.bulkActionDeleteId, '')
      dispatch(setBulkActionsInitialState())
    }
  }

  const onBulkDeleting = (data: any) => {
    if (data.status === BulkActionsServerEvent.Error) {
      dispatch(disconnectBulkDeleteAction())
      dispatch(addErrorNotification({ response: { data: data.error } }))
    }

    socketRef.current?.on(BulkActionsServerEvent.Overview, (payload: any) => {
      dispatch(setBulkDeleteLoading(isProcessingBulkAction(payload.status)))
      dispatch(setDeleteOverview(payload))

      if (payload.status === BulkActionsStatus.Failed) {
        dispatch(disconnectBulkDeleteAction())
      }
    })
  }

  const onBulkDeleteAborted = (data: any) => {
    dispatch(setBulkDeleteLoading(false))
    sessionStorageService.set(BrowserStorageItem.bulkActionDeleteId, '')
    dispatch(setDeleteOverview(data))
    handleDisconnect()
  }

  useEffect(() => {
    if (!isConnected && socketRef.current?.connected) {
      handleDisconnect()
    }
  }, [isConnected])

  const handleDisconnect = () => {
    dispatch(disconnectBulkDeleteAction())
    socketRef.current?.removeAllListeners()
    socketRef.current?.disconnect()
  }

  return null
}

export default BulkActionsConfig
