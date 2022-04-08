import React, { useEffect, useState } from 'react'
import {
  EuiText,
  EuiFlexGroup
} from '@elastic/eui'
import { isNull } from 'lodash'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import {
  selectedKeyDataSelector,
  selectedKeySelector,
  keysSelector,
} from 'uiSrc/slices/keys'
import { KeyTypes, ModulesKeyTypes, MODULES_KEY_TYPES_NAMES } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
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
import ModulesTypeDetails from '../../modules-type-details/ModulesTypeDetails'

import styles from '../styles.module.scss'

export interface Props {
  onClose: (key: string) => void;
  onRefresh: (key: string, type: KeyTypes) => void;
  onDelete: (key: string) => void;
  onEditTTL: (key: string, ttl: number) => void;
  onEditKey: (key: string, newKey: string, onFailure?: () => void) => void;
}

const KeyDetails = ({ ...props }: Props) => {
  const { loading, error = '', data } = useSelector(selectedKeySelector)
  const { type: selectedKeyType, name: selectedKey } = useSelector(selectedKeyDataSelector) ?? {
    type: KeyTypes.String,
  }
  const isKeySelected = !isNull(useSelector(selectedKeyDataSelector))
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)
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
      event: viewType === KeyViewType.Browser
        ? TelemetryEvent.BROWSER_KEY_ADD_VALUE_CLICKED
        : TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CLICKED,
      eventData: {
        databaseId: instanceId,
        keyType: selectedKeyType
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
        event: viewType === KeyViewType.Browser
          ? TelemetryEvent.BROWSER_KEY_ADD_VALUE_CANCELLED
          : TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CANCELLED,
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
                keyType={selectedKeyType}
                {...props}
              />
              <div className="key-details-body" key="key-details-body">
                {!loading && (
                  <div className="flex-column" style={{ flex: '1', height: '100%' }}>
                    {selectedKeyType === KeyTypes.ZSet && (
                      <ZSetDetails
                        isFooterOpen={isAddItemPanelOpen}
                      />
                    )}
                    {selectedKeyType === KeyTypes.Set && (
                      <SetDetails
                        isFooterOpen={isAddItemPanelOpen}
                      />
                    )}
                    {selectedKeyType === KeyTypes.String && (
                      <StringDetails
                        isEditItem={editItem}
                        setIsEdit={(isEdit) => setEditItem(isEdit)}
                      />
                    )}
                    {selectedKeyType === KeyTypes.Hash && (
                      <HashDetails
                        isFooterOpen={isAddItemPanelOpen}
                      />
                    )}
                    {selectedKeyType === KeyTypes.List && (
                      <ListDetails
                        isFooterOpen={isAddItemPanelOpen || isRemoveItemPanelOpen}
                      />
                    )}
                    {selectedKeyType === KeyTypes.ReJSON && (
                      <RejsonDetailsWrapper />
                    )}

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
                  </div>
                )}
                {isRemoveItemPanelOpen && (
                  <div className={cx('formFooterBar', styles.contentActive)}>
                    {selectedKeyType === KeyTypes.List && (
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
