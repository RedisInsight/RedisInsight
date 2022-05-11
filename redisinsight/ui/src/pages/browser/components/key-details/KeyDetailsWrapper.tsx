import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  deleteKeyAction,
  editKey,
  editKeyTTL,
  fetchKeyInfo,
  refreshKeyInfoAction,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { refreshHashFieldsAction } from 'uiSrc/slices/browser/hash'
import { refreshZsetMembersAction } from 'uiSrc/slices/browser/zset'
import { resetStringValue } from 'uiSrc/slices/browser/string'
import { refreshSetMembersAction } from 'uiSrc/slices/browser/set'
import { refreshListElementsAction } from 'uiSrc/slices/browser/list'
import KeyDetails from './KeyDetails/KeyDetails'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onCloseKey: () => void
  onEditKey: (key: string, newKey: string) => void
  onDeleteKey: () => void
  keyProp: string | null
}

const KeyDetailsWrapper = (props: Props) => {
  const {
    isFullScreen,
    onToggleFullScreen,
    onCloseKey,
    onEditKey,
    onDeleteKey,
    keyProp
  } = props
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

  const handleRefreshKey = (key: string, type: KeyTypes) => {
    switch (type) {
      case KeyTypes.Hash: {
        dispatch(refreshKeyInfoAction(key))
        dispatch(refreshHashFieldsAction(key))
        break
      }
      case KeyTypes.ZSet: {
        dispatch(refreshKeyInfoAction(key))
        dispatch(refreshZsetMembersAction(key))
        break
      }
      case KeyTypes.Set: {
        dispatch(refreshKeyInfoAction(key))
        dispatch(refreshSetMembersAction(key))
        break
      }
      case KeyTypes.List: {
        dispatch(refreshKeyInfoAction(key))
        dispatch(refreshListElementsAction(key))
        break
      }
      default:
        dispatch(fetchKeyInfo(key))
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
    <KeyDetails
      isFullScreen={isFullScreen}
      onToggleFullScreen={onToggleFullScreen}
      onClose={handleClose}
      onClosePanel={handleClosePanel}
      onRefresh={handleRefreshKey}
      onDelete={handleDeleteKey}
      onEditTTL={handleEditTTL}
      onEditKey={handleEditKey}
    />
  )
}

export default KeyDetailsWrapper
