import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteKeyAction,
  editKey,
  editKeyTTL,
  fetchKeyInfo,
  refreshKeyInfoAction,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import { getTimestampFromId } from 'uiSrc/utils/streamUtils'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { SCAN_STREAM_START_DEFAULT, SCAN_STREAM_END_DEFAULT } from 'uiSrc/constants/api'
import { refreshHashFieldsAction } from 'uiSrc/slices/browser/hash'
import { refreshZsetMembersAction } from 'uiSrc/slices/browser/zset'
import { fetchString, resetStringValue } from 'uiSrc/slices/browser/string'
import { refreshSetMembersAction } from 'uiSrc/slices/browser/set'
import { refreshListElementsAction } from 'uiSrc/slices/browser/list'
import { fetchReJSON } from 'uiSrc/slices/browser/rejson'
import { refreshStreamEntries, streamDataSelector } from 'uiSrc/slices/browser/stream'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'
import KeyDetails from './KeyDetails/KeyDetails'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
  onCloseKey: () => void
  onEditKey: (key: string, newKey: string) => void
  onDeleteKey: () => void
  keyProp: string | null
}

const KeyDetailsWrapper = (props: Props) => {
  const {
    isFullScreen,
    arePanelsCollapsed,
    onToggleFullScreen,
    onCloseKey,
    onEditKey,
    onDeleteKey,
    keyProp
  } = props

  const [startVal, setStartVal] = useState<number>()
  const [endVal, setEndVal] = useState<number>()

  const { firstEntry, lastEntry } = useSelector(streamDataSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (keyProp === null) {
      return
    }
    // Restore key details from context in future
    // (selectedKey.data?.name !== keyProp)
    dispatch(fetchKeyInfo(keyProp))
  }, [keyProp])

  const handleDeleteKey = (key: string, type: string) => {
    if (type === KeyTypes.String) {
      dispatch(deleteKeyAction(key, () => {
        dispatch(resetStringValue())
        onDeleteKey()
      }))
      return
    }
    dispatch(deleteKeyAction(key, onDeleteKey))
  }

  const handleRefreshKey = (key: string, type: KeyTypes | ModulesKeyTypes) => {
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
        dispatch(fetchString(key, resetData))
        break
      }
      case KeyTypes.ReJSON: {
        dispatch(fetchReJSON(key, '.', resetData))
        break
      }
      case KeyTypes.Stream: {
        const firstEntryTimeStamp = getTimestampFromId(firstEntry?.id)
        const lastEntryTimeStamp = getTimestampFromId(lastEntry?.id)

        const lastEntryFilter = endVal === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : endVal?.toString()
        const firstEntryFilter = startVal === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : startVal?.toString()
        dispatch(refreshStreamEntries(key, firstEntryFilter!, lastEntryFilter!, resetData))
        break
      }
      default:
        dispatch(fetchKeyInfo(key, resetData))
    }
  }

  const handleEditTTL = (key: string, ttl: number) => {
    dispatch(editKeyTTL(key, ttl))
  }
  const handleEditKey = (oldKey: string, newKey: string, onFailure?: () => void) => {
    dispatch(editKey(oldKey, newKey, () => onEditKey(oldKey, newKey), onFailure))
  }

  const handleClose = () => {
    onCloseKey()
  }

  const handleClosePanel = () => {
    dispatch(toggleBrowserFullScreen())
  }

  return (
    <StreamRangeStartContext.Provider value={{ startVal, setStartVal }}>
      <StreamRangeEndContext.Provider value={{ endVal, setEndVal }}>
        <KeyDetails
          isFullScreen={isFullScreen}
          arePanelsCollapsed={arePanelsCollapsed}
          onToggleFullScreen={onToggleFullScreen}
          onClose={handleClose}
          onClosePanel={handleClosePanel}
          onRefresh={handleRefreshKey}
          onDelete={handleDeleteKey}
          onEditTTL={handleEditTTL}
          onEditKey={handleEditKey}
        />
      </StreamRangeEndContext.Provider>
    </StreamRangeStartContext.Provider>
  )
}

export default KeyDetailsWrapper
