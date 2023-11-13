import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingContent,
  EuiToolTip,
} from '@elastic/eui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { GroupBadge, AutoRefresh, FullScreen } from 'uiSrc/components'
import {
  KeyTypes,
  ModulesKeyTypes,
} from 'uiSrc/constants'
import {
  deleteSelectedKeyAction,
  editKey,
  editKeyTTL,
  initialKeyInfo,
  keysSelector,
  refreshKey,
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { resetStringValue } from 'uiSrc/slices/browser/string'
import { KeyDetailsHeaderFormatter } from './components/key-details-header-formatter'
import { KeyDetailsHeaderName } from './components/key-details-header-name'
import { KeyDetailsHeaderTTL } from './components/key-details-header-ttl'
import { KeyDetailsHeaderActions } from './components/key-details-header-actions'
import { KeyDetailsHeaderDelete } from './components/key-details-header-delete'
import { KeyDetailsHeaderSizeLength } from './components/key-details-header-size-length'
import { HIDE_LAST_REFRESH } from './constants'

import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  onClose: (key: RedisResponseBuffer) => void
  onRemoveKey: () => void
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => void
  onAddItem?: () => void
  onEditItem?: () => void
  onRemoveItem?: () => void
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
}

const KeyDetailsHeader = ({
  isFullScreen,
  arePanelsCollapsed,
  onToggleFullScreen = () => {},
  onClose,
  onRemoveKey,
  onEditKey,
  keyType,
  onAddItem = () => {},
  onEditItem = () => {},
  onRemoveItem = () => {},
}: Props) => {
  const { loading, lastRefreshTime } = useSelector(selectedKeySelector)
  const {
    type,
    length,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()

  const handleRefreshKey = () => {
    dispatch(refreshKey(keyBuffer!, type))
  }

  const handleEditTTL = (key: RedisResponseBuffer, ttl: number) => {
    dispatch(editKeyTTL(key, ttl))
  }
  const handleEditKey = (oldKey: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => {
    dispatch(editKey(oldKey, newKey, () => onEditKey(oldKey, newKey), onFailure))
  }

  const handleDeleteKey = (key: RedisResponseBuffer, type: string) => {
    dispatch(deleteSelectedKeyAction(key,
      () => {
        if (type === KeyTypes.String) {
          dispatch(resetStringValue())
        }
        onRemoveKey()
      }))
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    const browserViewEvent = enableAutoRefresh
      ? TelemetryEvent.BROWSER_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.BROWSER_KEY_DETAILS_AUTO_REFRESH_DISABLED
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        length,
        databaseId: instanceId,
        keyType: type,
        refreshRate: +refreshRate
      }
    })
  }

  const handleChangeAutoRefreshRate = (enableAutoRefresh: boolean, refreshRate: string) => {
    if (enableAutoRefresh) {
      handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
    }
  }

  return (
    <div className={`key-details-header ${styles.container}`} data-testid="key-details-header">
      {loading ? (
        <div>
          <EuiLoadingContent lines={2} />
        </div>
      ) : (
        <AutoSizer disableHeight>
          {({ width = 0 }) => (
            <div style={{ width }}>
              <EuiFlexGroup
                responsive={false}
                gutterSize="s"
                alignItems="center"
                className={styles.keyFlexGroup}
              >
                <EuiFlexItem grow={false}>
                  <GroupBadge type={type} />
                </EuiFlexItem>
                <KeyDetailsHeaderName onEditKey={handleEditKey} />
                <EuiFlexItem />
                {!arePanelsCollapsed && (
                  <EuiFlexItem grow={false} style={{ marginRight: '8px' }}>
                    <FullScreen isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} />
                  </EuiFlexItem>
                )}
                <EuiFlexItem grow={false}>
                  {(!arePanelsCollapsed || isFullScreen) && (
                    <EuiToolTip
                      content="Close"
                      position="left"
                    >
                      <EuiButtonIcon
                        iconType="cross"
                        color="primary"
                        aria-label="Close key"
                        className={styles.closeBtn}
                        onClick={() => onClose(keyProp)}
                        data-testid="close-key-btn"
                      />
                    </EuiToolTip>
                  )}
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup
                responsive={false}
                justifyContent="center"
                alignItems="center"
                className={styles.groupSecondLine}
                gutterSize="m"
              >
                <KeyDetailsHeaderSizeLength width={width} />
                <KeyDetailsHeaderTTL onEditTTL={handleEditTTL} />
                <EuiFlexItem>
                  <div className={styles.subtitleActionBtns}>
                    <AutoRefresh
                      postfix={type}
                      loading={loading}
                      lastRefreshTime={lastRefreshTime}
                      displayText={width > HIDE_LAST_REFRESH}
                      containerClassName={styles.actionBtn}
                      onRefresh={handleRefreshKey}
                      onEnableAutoRefresh={handleEnableAutoRefresh}
                      onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                      testid="refresh-key-btn"
                    />
                    {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
                      <KeyDetailsHeaderFormatter width={width} />
                    )}
                    {keyType && (
                      <KeyDetailsHeaderActions
                        width={width}
                        keyType={keyType}
                        onAddItem={onAddItem}
                        onEditItem={onEditItem}
                        onRemoveItem={onRemoveItem}
                      />
                    )}
                    <KeyDetailsHeaderDelete onDelete={handleDeleteKey} />
                  </div>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          )}
        </AutoSizer>
      )}
    </div>
  )
}

export { KeyDetailsHeader }
