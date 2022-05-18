import React, { useEffect, useState, useContext } from 'react'
import {
  EuiText,
  EuiFlexGroup,
  EuiButtonIcon,
  EuiToolTip
} from '@elastic/eui'
import { isNull } from 'lodash'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import {
  AddStreamEntries,
  AddListElements,
  AddSetMembers,
  AddZsetMembers,
  AddHashFields
} from 'uiSrc/pages/browser/components/key-details-add-items'

import {
  selectedKeyDataSelector,
  selectedKeySelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes, ModulesKeyTypes, MODULES_KEY_TYPES_NAMES } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'

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
  onClose: (key: string) => void
  onClosePanel: () => void
  onRefresh: (key: string, type: KeyTypes) => void
  onDelete: (key: string, type: string) => void
  onEditTTL: (key: string, ttl: number) => void
  onEditKey: (key: string, newKey: string, onFailure?: () => void) => void
}

const KeyDetails = ({ ...props }: Props) => {
  const { onClosePanel } = props
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

  const { setStartVal } = useContext(StreamRangeStartContext)
  const { setEndVal } = useContext(StreamRangeEndContext)

  useEffect(() => {
    // Close 'Add Item Panel' and remove stream range on change selected key
    closeAddItemPanel()
    setStartVal(undefined)
    setEndVal(undefined)
  }, [selectedKey])

  const openAddItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
    setIsAddItemPanelOpen(true)
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

  const openRemoveItemPanel = () => {
    setIsAddItemPanelOpen(false)
    setIsRemoveItemPanelOpen(true)
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    if (isCancelled && isAddItemPanelOpen) {
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
    [KeyTypes.ZSet]: <ZSetDetails isFooterOpen={isAddItemPanelOpen} />,
    [KeyTypes.Set]: <SetDetails isFooterOpen={isAddItemPanelOpen} />,
    [KeyTypes.String]: (
      <StringDetails
        isEditItem={editItem}
        setIsEdit={(isEdit) => setEditItem(isEdit)}
      />
    ),
    [KeyTypes.Hash]: <HashDetails isFooterOpen={isAddItemPanelOpen} />,
    [KeyTypes.List]: <ListDetails isFooterOpen={isAddItemPanelOpen || isRemoveItemPanelOpen} />,
    [KeyTypes.ReJSON]: <RejsonDetailsWrapper />,
    [KeyTypes.Stream]: <StreamDetailsWrapper isFooterOpen={isAddItemPanelOpen} />,
  }

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
                  <p data-testid="no-keys-selected-text">
                    {error
                      || 'Select the key from the list on the left to see the details of the key.'}
                  </p>
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
                      <AddStreamEntries onCancel={closeAddItemPanel} />
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
