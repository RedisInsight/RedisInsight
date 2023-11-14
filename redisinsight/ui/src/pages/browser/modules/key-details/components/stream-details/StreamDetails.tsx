import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes, STREAM_ADD_GROUP_VIEW_TYPES } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { streamSelector } from 'uiSrc/slices/browser/stream'
import { StreamDetailsBody } from './stream-details-body'

import { AddItemsPanel } from '../add-items-panel'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const StreamDetails = (props: Props) => {
  const keyType = KeyTypes.Stream
  const { onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)
  const { viewType: streamViewType } = useSelector(streamSelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)

    if (!STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType)) {
      onOpenAddItemPanel()
    }
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (isCancelled && isAddItemPanelOpen && !STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType)) {
      onCloseAddItemPanel()
    }
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
            <StreamDetailsBody isFooterOpen={isAddItemPanelOpen} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <AddItemsPanel
            selectedKeyType={keyType}
            streamViewType={streamViewType}
            closeAddItemPanel={closeAddItemPanel}
          />
        )}
      </div>
    </div>
  )
}

export { StreamDetails }
