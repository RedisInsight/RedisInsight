import React, { useEffect, useState } from 'react'
import {
  EuiText,
  EuiFlexGroup
} from '@elastic/eui'
import { isNull } from 'lodash'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { DataTypes } from 'uiSrc/constants'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import AddHashFields from '../../key-details-add-items/add-hash-fields/AddHashFields'
import AddZsetMembers from '../../key-details-add-items/add-zset-members/AddZsetMembers'
import AddSetMembers from '../../key-details-add-items/add-set-members/AddSetMembers'
import AddListElements from '../../key-details-add-items/add-list-elements/AddListElements'
import KeyDetailsHeader from '../../key-details-header/KeyDetailsHeader'
import ZSetDetails from '../../zset-details/ZSetDetails'
import StringDetails from '../../string-details/StringDetails'
import SetDetails from '../../set-details/SetDetails'
import HashDetails from '../../hash-details/HashDetails'
import ListDetails from '../../list-details/ListDetails'
import RejsonDetailsWrapper from '../../rejson-details/RejsonDetailsWrapper'
import RemoveListElements from '../../key-details-remove-items/remove-list-elements/RemoveListElements'
import UnsupportedTypeDetails from '../../unsupported-type-details/UnsupportedTypeDetails'

import styles from '../styles.module.scss'

export interface Props {
  onClose: (key: string) => void;
  onRefresh: (key: string, type: DataTypes) => void;
  onDelete: (key: string) => void;
  onEditTTL: (key: string, ttl: number) => void;
  onEditKey: (key: string, newKey: string, onFailure?: () => void) => void;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const KeyDetails = ({ ...props }: Props) => {
  const { loading, error = '', data } = useSelector(selectedKeySelector)
  const { type: selectedDataType, name: selectedKey } = useSelector(selectedKeyDataSelector) ?? {
    type: DataTypes.String,
  }
  const isKeySelected = !isNull(useSelector(selectedKeyDataSelector))
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [isRemoveItemPanelOpen, setIsRemoveItemPanelOpen] = useState<boolean>(false)
  const [editItem, setEditItem] = useState<boolean>(false)

  useEffect(() => {
    // Close 'Add Item Panel' on change selected key
    closeAddItemPanel()
  }, [selectedKey])

  const openAddItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
    setIsAddItemPanelOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_KEY_ADD_VALUE_CLICKED,
      eventData: {
        databaseId: instanceId,
        dataType: selectedDataType
      }
    })
  }

  const openRemoveItemPanel = () => {
    setIsAddItemPanelOpen(false)
    setIsRemoveItemPanelOpen(true)
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    if (isCancelled && isAddItemPanelOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.BROWSER_KEY_ADD_VALUE_CANCELLED,
        eventData: {
          databaseId: instanceId,
          dataType: selectedDataType
        }
      })
    }
    setIsAddItemPanelOpen(false)
  }

  const closeRemoveItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
  }

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        className={[
          styles.content,
          data || error || loading ? styles.contentActive : null,
        ].join(' ')}
        gutterSize="none"
      >
        <>
          {!isKeySelected ? (
            <div className={styles.placeholder}>
              <EuiText textAlign="center" grow color="subdued" size="m">
                <p>
                  {error
                    || 'Select the key from the list on the left to see the details of the key.'}
                </p>
              </EuiText>
            </div>
          ) : (
            <div className="fluid flex-column relative">
              <KeyDetailsHeader
                key="key-details-header"
                onAddItem={openAddItemPanel}
                onRemoveItem={openRemoveItemPanel}
                onEditItem={() => setEditItem(!editItem)}
                dataType={selectedDataType}
                {...props}
              />
              <div className="key-details-body" key="key-details-body">
                {!loading && (
                  <div className="flex-column" style={{ flex: '1', height: '100%' }}>
                    {selectedDataType === DataTypes.ZSet && (
                      <ZSetDetails
                        isFooterOpen={isAddItemPanelOpen}
                      />
                    )}
                    {selectedDataType === DataTypes.Set && (
                      <SetDetails
                        isFooterOpen={isAddItemPanelOpen}
                      />
                    )}
                    {selectedDataType === DataTypes.String && (
                      <StringDetails
                        isEditItem={editItem}
                        setIsEdit={(isEdit) => setEditItem(isEdit)}
                      />
                    )}
                    {selectedDataType === DataTypes.Hash && (
                      <HashDetails
                        isFooterOpen={isAddItemPanelOpen}
                      />
                    )}
                    {selectedDataType === DataTypes.List && (
                      <ListDetails
                        isFooterOpen={isAddItemPanelOpen || isRemoveItemPanelOpen}
                      />
                    )}
                    {selectedDataType === DataTypes.ReJSON && (
                      <RejsonDetailsWrapper />
                    )}

                    {!(Object.values(DataTypes).includes(selectedDataType)) && (
                      <UnsupportedTypeDetails />
                    )}
                  </div>
                )}
                {isAddItemPanelOpen && (
                  <div className={cx('formFooterBar', styles.contentActive)}>
                    {selectedDataType === DataTypes.Hash && (
                      <AddHashFields onCancel={closeAddItemPanel} />
                    )}
                    {selectedDataType === DataTypes.ZSet && (
                      <AddZsetMembers onCancel={closeAddItemPanel} />
                    )}
                    {selectedDataType === DataTypes.Set && (
                      <AddSetMembers onCancel={closeAddItemPanel} />
                    )}
                    {selectedDataType === DataTypes.List && (
                      <AddListElements onCancel={closeAddItemPanel} />
                    )}
                  </div>
                )}
                {isRemoveItemPanelOpen && (
                  <div className={cx('formFooterBar', styles.contentActive)}>
                    {selectedDataType === DataTypes.List && (
                      <RemoveListElements onCancel={closeRemoveItemPanel} />
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
