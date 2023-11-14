import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { HashDetailsTable } from './hash-details-table'

import { AddItemsPanel } from '../add-items-panel'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const HashDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = () => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel()
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        onAddItem={openAddItemPanel}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <HashDetailsTable isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <AddItemsPanel
            selectedKeyType={keyType}
            closeAddItemPanel={closeAddItemPanel}
          />
        )}
      </div>
    </div>
  )
}

export { HashDetails }
