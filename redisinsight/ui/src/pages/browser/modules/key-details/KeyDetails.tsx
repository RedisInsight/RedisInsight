import React, { useEffect } from 'react'
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
import { KeyTypes } from 'uiSrc/constants'

import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { NoKeySelected } from './components/no-key-selected'
import { DynamicTypeDetails } from './components/dynamic-type-details'

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
    keyProp,
    totalKeys,
    keysLastRefreshTime,
  } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewType } = useSelector(keysSelector)
  const { loading, error = '', data } = useSelector(selectedKeySelector)
  const isKeySelected = !isNull(useSelector(selectedKeyDataSelector))
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

  const onCloseAddItemPanel = () => {
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

  const onOpenAddItemPanel = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_VALUE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CLICKED
      ),
      eventData: {
        databaseId: instanceId,
        keyType,
      }
    })
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
          <DynamicTypeDetails
            {...props}
            keyType={keyType}
            onOpenAddItemPanel={onOpenAddItemPanel}
            onCloseAddItemPanel={onCloseAddItemPanel}
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(KeyDetails)
