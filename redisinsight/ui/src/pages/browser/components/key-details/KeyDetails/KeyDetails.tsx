import React, { useEffect, useState } from 'react'
import {
  EuiText,
  EuiFlexGroup,
  EuiButtonIcon,
  EuiToolTip,
} from '@elastic/eui'
import { isNull } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  AddStreamEntries,
  AddListElements,
  AddSetMembers,
  AddZsetMembers,
  AddHashFields,
  AddStreamGroup
} from 'uiSrc/pages/browser/components/key-details-add-items'

import {
  selectedKeyDataSelector,
  selectedKeySelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { cleanRangeFilter, streamSelector } from 'uiSrc/slices/browser/stream'
import { KeyTypes, ModulesKeyTypes, MODULES_KEY_TYPES_NAMES, STREAM_ADD_GROUP_VIEW_TYPES } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import ExploreGuides from 'uiSrc/components/explore-guides'
import { Nullable } from 'uiSrc/utils'
import KeyDetailsHeader from '../../key-details-header/KeyDetailsHeader'
import ZSetDetails from '../../zset-details/ZSetDetails'
import StringDetails from '../../string-details/StringDetails'
import SetDetails from '../../set-details/SetDetails'
import HashDetails from '../../hash-details/HashDetails'
import ListDetails from '../../list-details/ListDetails'
import RejsonDetailsWrapper from '../../rejson-details/RejsonDetailsWrapper'
import StreamDetailsWrapper from '../../stream-details'
import RemoveListElements from '../../key-details-remove-items/remove-list-elements/RemoveListElements'
import UnsupportedTypeDetails from '../../unsupported-type-details/UnsupportedTypeDetails'
import ModulesTypeDetails from '../../modules-type-details/ModulesTypeDetails'

import styles from '../styles.module.scss'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
  onClose: (key: RedisResponseBuffer) => void
  onClosePanel: () => void
  onRefresh: (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes) => void
  onDelete: (key: RedisResponseBuffer, type: string) => void
  onRemoveKey: () => void
  onEditTTL: (key: RedisResponseBuffer, ttl: number) => void
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => void
  totalKeys: number
  keysLastRefreshTime: Nullable<number>
}

const KeyDetails = ({ ...props }: Props) => {
  const { onClosePanel, onRemoveKey, totalKeys, keysLastRefreshTime } = props
  const { loading, error = '', data } = useSelector(selectedKeySelector)
  const { type: selectedKeyType, name: selectedKey } = useSelector(selectedKeyDataSelector) ?? {
    type: KeyTypes.String,
  }
  const isKeySelected = !isNull(useSelector(selectedKeyDataSelector))
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)
  const { viewType: streamViewType } = useSelector(streamSelector)
  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [isRemoveItemPanelOpen, setIsRemoveItemPanelOpen] = useState<boolean>(false)
  const [editItem, setEditItem] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    // Close 'Add Item Panel' and remove stream range on change selected key
    closeAddItemPanel()
    dispatch(cleanRangeFilter())
  }, [selectedKey])

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
          keyType: selectedKeyType
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
          TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CANCELLED
        ),
        eventData: {
          databaseId: instanceId,
          keyType: selectedKeyType
        }
      })
    }
    setIsAddItemPanelOpen(false)
  }

  const closeRemoveItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
  }

  const TypeDetails: any = {
    [KeyTypes.ZSet]: <ZSetDetails isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />,
    [KeyTypes.Set]: <SetDetails isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />,
    [KeyTypes.String]: (
      <StringDetails
        isEditItem={editItem}
        setIsEdit={(isEdit) => setEditItem(isEdit)}
      />
    ),
    [KeyTypes.Hash]: <HashDetails isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />,
    [KeyTypes.List]: <ListDetails isFooterOpen={isAddItemPanelOpen || isRemoveItemPanelOpen} />,
    [KeyTypes.ReJSON]: <RejsonDetailsWrapper />,
    [KeyTypes.Stream]: <StreamDetailsWrapper isFooterOpen={isAddItemPanelOpen} />,
  }

  const NoKeysSelectedMessage = () => (
    <>
      {totalKeys > 0 ? (
        <span data-testid="select-key-message">
          Select the key from the list on the left to see the details of the key.
        </span>
      ) : (<ExploreGuides />)}
    </>
  )

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        className={cx(styles.content, { [styles.contentActive]: data || error || loading })}
        gutterSize="none"
      >
        <>
          {!isKeySelected && !loading ? (
            <>
              <EuiToolTip
                content="Close"
                position="left"
                anchorClassName={styles.closeRightPanel}
              >
                <EuiButtonIcon
                  iconType="cross"
                  color="primary"
                  aria-label="Close panel"
                  className={styles.closeBtn}
                  onClick={onClosePanel}
                  data-testid="close-right-panel-btn"
                />
              </EuiToolTip>

              <div className={styles.placeholder}>
                <EuiText textAlign="center" grow color="subdued" size="m">
                  {error ? (
                    <p data-testid="no-keys-selected-text">
                      {error}
                    </p>
                  ) : (!!keysLastRefreshTime && <NoKeysSelectedMessage />)}
                </EuiText>
              </div>
            </>
          ) : (
            <div className="fluid flex-column relative">
              <KeyDetailsHeader
                key="key-details-header"
                onAddItem={openAddItemPanel}
                onRemoveItem={openRemoveItemPanel}
                onEditItem={() => setEditItem(!editItem)}
                keyType={selectedKeyType}
                {...props}
              />
              <div className="key-details-body" key="key-details-body">
                {!loading && (
                  <div className="flex-column" style={{ flex: '1', height: '100%' }}>
                    {(selectedKeyType && selectedKeyType in TypeDetails) && TypeDetails[selectedKeyType]}

                    {(Object.values(ModulesKeyTypes).includes(selectedKeyType)) && (
                      <ModulesTypeDetails moduleName={MODULES_KEY_TYPES_NAMES[selectedKeyType]} />
                    )}

                    {!(Object.values(KeyTypes).includes(selectedKeyType))
                    && !(Object.values(ModulesKeyTypes).includes(selectedKeyType)) && (
                      <UnsupportedTypeDetails />
                    )}
                  </div>
                )}
                {isAddItemPanelOpen && (
                  <div className={cx('formFooterBar', styles.contentActive)}>
                    {selectedKeyType === KeyTypes.Hash && (
                      <AddHashFields onCancel={closeAddItemPanel} />
                    )}
                    {selectedKeyType === KeyTypes.ZSet && (
                      <AddZsetMembers onCancel={closeAddItemPanel} />
                    )}
                    {selectedKeyType === KeyTypes.Set && (
                      <AddSetMembers onCancel={closeAddItemPanel} />
                    )}
                    {selectedKeyType === KeyTypes.List && (
                      <AddListElements onCancel={closeAddItemPanel} />
                    )}
                    {selectedKeyType === KeyTypes.Stream && (
                      <>
                        {streamViewType === StreamViewType.Data && (
                          <AddStreamEntries onCancel={closeAddItemPanel} />
                        )}
                        {STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType) && (
                          <AddStreamGroup onCancel={closeAddItemPanel} />
                        )}
                      </>
                    )}
                  </div>
                )}
                {isRemoveItemPanelOpen && (
                  <div className={cx('formFooterBar', styles.contentActive)}>
                    {selectedKeyType === KeyTypes.List && (
                      <RemoveListElements onCancel={closeRemoveItemPanel} onRemoveKey={onRemoveKey} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      </EuiFlexGroup>
    </div>
  )
}

export default KeyDetails
