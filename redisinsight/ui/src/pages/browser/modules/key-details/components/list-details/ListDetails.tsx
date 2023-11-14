import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import {
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { ListDetailsTable } from './list-details-table'

import { AddItemsPanel } from '../add-items-panel'
import { RemoveListElements } from '../key-details-remove-items'

import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const ListDetails = (props: Props) => {
  const keyType = KeyTypes.List
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props
  const { loading } = useSelector(selectedKeySelector)

  const [isRemoveItemPanelOpen, setIsRemoveItemPanelOpen] = useState<boolean>(false)
  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = () => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel()
  }

  const closeRemoveItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
  }

  const openRemoveItemPanel = () => {
    setIsAddItemPanelOpen(false)
    setIsRemoveItemPanelOpen(true)
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        onAddItem={openAddItemPanel}
        onRemoveItem={openRemoveItemPanel}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <ListDetailsTable isFooterOpen={isAddItemPanelOpen} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <AddItemsPanel
            selectedKeyType={keyType}
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

  )
}

export { ListDetails }
