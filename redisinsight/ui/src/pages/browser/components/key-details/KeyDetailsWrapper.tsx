import React, { useEffect } from 'react'
import { isUndefined } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  deleteSelectedKeyAction,
  editKey,
  editKeyTTL,
  fetchKeyInfo,
  keysSelector,
  refreshKeyInfoAction,
  selectedKeyDataSelector,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes, ModulesKeyTypes, STRING_MAX_LENGTH } from 'uiSrc/constants'
import { refreshHashFieldsAction } from 'uiSrc/slices/browser/hash'
import { refreshZsetMembersAction } from 'uiSrc/slices/browser/zset'
import { fetchString, resetStringValue } from 'uiSrc/slices/browser/string'
import { refreshSetMembersAction } from 'uiSrc/slices/browser/set'
import { refreshListElementsAction } from 'uiSrc/slices/browser/list'
import { fetchReJSON } from 'uiSrc/slices/browser/rejson'
import { refreshStream } from 'uiSrc/slices/browser/stream'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'
import KeyDetails from './KeyDetails/KeyDetails'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
  onCloseKey: () => void
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer) => void
  onRemoveKey: () => void
  keyProp: RedisResponseBuffer | null
  totalKeys: number
  keysLastRefreshTime: Nullable<number>
}

const KeyDetailsWrapper = (props: Props) => {
  const {
    isFullScreen,
    arePanelsCollapsed,
    onToggleFullScreen,
    onCloseKey,
    onEditKey,
    onRemoveKey,
    keyProp,
    totalKeys,
    keysLastRefreshTime,
  } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewType } = useSelector(keysSelector)
  const { type: keyType, name: keyName, length: keyLength } = useSelector(selectedKeyDataSelector) ?? {
    type: KeyTypes.String,
  }

  const dispatch = useDispatch()

  useEffect(() => {
    if (keyProp === null) {
      return
    }
    // Restore key details from context in future
    // (selectedKey.data?.name !== keyProp)
    dispatch(fetchKeyInfo(keyProp))
  }, [keyProp])

  useEffect(() => {
    if (!isUndefined(keyName)) {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_VIEWED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_VIEWED
        ),
        eventData: {
          keyType,
          databaseId: instanceId,
          length: keyLength,
        }
      })
    }
  }, [keyName])

  const handleDeleteKey = (key: RedisResponseBuffer, type: string) => {
    dispatch(deleteSelectedKeyAction(key,
      () => {
        if (type === KeyTypes.String) {
          dispatch(resetStringValue())
        }
        onRemoveKey()
      }))
  }

  const handleRefreshKey = (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes, args: IFetchKeyArgs) => {
    const resetData = false
    dispatch(refreshKeyInfoAction(key))
    switch (type) {
      case KeyTypes.Hash: {
        dispatch(refreshHashFieldsAction(key, resetData))
        break
      }
      case KeyTypes.ZSet: {
        dispatch(refreshZsetMembersAction(key, resetData))
        break
      }
      case KeyTypes.Set: {
        dispatch(refreshSetMembersAction(key, resetData))
        break
      }
      case KeyTypes.List: {
        dispatch(refreshListElementsAction(key, resetData))
        break
      }
      case KeyTypes.String: {
        dispatch(fetchString(key, { resetData, end: args?.end || STRING_MAX_LENGTH }))
        break
      }
      case KeyTypes.ReJSON: {
        dispatch(fetchReJSON(key, '.', true))
        break
      }
      case KeyTypes.Stream: {
        dispatch(refreshStream(key, resetData))
        break
      }
      default:
        dispatch(fetchKeyInfo(key, resetData))
    }
  }

  const handleEditTTL = (key: RedisResponseBuffer, ttl: number) => {
    dispatch(editKeyTTL(key, ttl))
  }
  const handleEditKey = (oldKey: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => {
    dispatch(editKey(oldKey, newKey, () => onEditKey(oldKey, newKey), onFailure))
  }

  const handleClose = () => {
    onCloseKey()
  }

  const handleClosePanel = () => {
    dispatch(toggleBrowserFullScreen(true))
    keyProp && onCloseKey()
  }

  return (
    <KeyDetails
      isFullScreen={isFullScreen}
      arePanelsCollapsed={arePanelsCollapsed}
      onToggleFullScreen={onToggleFullScreen}
      onClose={handleClose}
      onClosePanel={handleClosePanel}
      onRefresh={handleRefreshKey}
      onDelete={handleDeleteKey}
      onRemoveKey={onRemoveKey}
      onEditTTL={handleEditTTL}
      onEditKey={handleEditKey}
      totalKeys={totalKeys}
      keysLastRefreshTime={keysLastRefreshTime}
    />
  )
}

export default React.memo(KeyDetailsWrapper)
