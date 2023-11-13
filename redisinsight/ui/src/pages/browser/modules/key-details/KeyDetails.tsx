import React, { useEffect, useState } from 'react'
import { isNull, isUndefined } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  fetchKeyInfo,
  keysSelector,
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes, STREAM_ADD_GROUP_VIEW_TYPES } from 'uiSrc/constants'

import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { KeyDetailsHeader } from 'uiSrc/pages/browser/modules'
import { streamSelector } from 'uiSrc/slices/browser/stream'
import { NoKeySelected } from './components/no-key-selected'
import { DynamicTypeDetails } from './components/dynamic-type-details'
import { AddItemsPanel } from './components/add-items-panel'
import { RemoveListElements } from './components/key-details-remove-items'

import styles from './styles.module.scss'

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

const KeyDetails = (props: Props) => {
  const {
    onCloseKey,
    onEditKey,
    onRemoveKey,
    keyProp,
    totalKeys,
    keysLastRefreshTime,
  } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewType } = useSelector(keysSelector)
  const { loading, error = '', data } = useSelector(selectedKeySelector)
  const isKeySelected = !isNull(useSelector(selectedKeyDataSelector))
  const { viewType: streamViewType } = useSelector(streamSelector)
  const { type: keyType, name: keyName, length: keyLength } = useSelector(selectedKeyDataSelector) ?? {
    type: KeyTypes.String,
  }

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [isRemoveItemPanelOpen, setIsRemoveItemPanelOpen] = useState<boolean>(false)
  const [editItem, setEditItem] = useState<boolean>(false)

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

  const openAddItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
    setIsAddItemPanelOpen(true)
    if (!STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType)) {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_ADD_VALUE_CLICKED,
          TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CLICKED
        ),
        eventData: {
          databaseId: instanceId,
          keyType
        }
      })
    }
  }

  const openRemoveItemPanel = () => {
    setIsAddItemPanelOpen(false)
    setIsRemoveItemPanelOpen(true)
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    if (isCancelled && isAddItemPanelOpen && !STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType)) {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_ADD_VALUE_CANCELLED,
          TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CANCELLED,
        ),
        eventData: {
          databaseId: instanceId,
          keyType,
        }
      })
    }
    setIsAddItemPanelOpen(false)
  }

  const closeRemoveItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
  }

  return (
    <div className={styles.container}>
      <div className={cx(styles.content, { [styles.contentActive]: data || error || loading })}>
        {!isKeySelected && !loading ? (
          <NoKeySelected
            keyProp={keyProp}
            totalKeys={totalKeys}
            keysLastRefreshTime={keysLastRefreshTime}
            error={error}
            onClosePanel={onCloseKey}
          />
        ) : (
          <div className="fluid flex-column relative">
            <KeyDetailsHeader
              {...props}
              key="key-details-header"
              keyType={keyType}
              onAddItem={openAddItemPanel}
              onRemoveItem={openRemoveItemPanel}
              onEditItem={() => setEditItem(!editItem)}
              onRemoveKey={onRemoveKey}
              onClose={onCloseKey}
              onEditKey={onEditKey}
            />
            <div className="key-details-body" key="key-details-body">
              {!loading && (
                <div className="flex-column" style={{ flex: '1', height: '100%' }}>
                  <DynamicTypeDetails
                    selectedKeyType={keyType}
                    isAddItemPanelOpen={isAddItemPanelOpen}
                    onRemoveKey={onRemoveKey}
                    editItem={editItem}
                    setEditItem={setEditItem}
                    isRemoveItemPanelOpen={isRemoveItemPanelOpen}
                  />
                </div>
              )}
              {isAddItemPanelOpen && (
                <AddItemsPanel
                  selectedKeyType={keyType}
                  streamViewType={streamViewType}
                  closeAddItemPanel={closeAddItemPanel}
                />
              )}
              {isRemoveItemPanelOpen && (
                <div className={cx('formFooterBar', styles.contentActive)}>
                  {keyType === KeyTypes.List && (
                    <RemoveListElements onCancel={closeRemoveItemPanel} onRemoveKey={onRemoveKey} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(KeyDetails)
