import React from 'react'
import { BulkActionsType } from 'uiSrc/constants'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

interface BulkActionsTabs {
  id: BulkActionsType
  label: React.ReactElement | string
  separator?: React.ReactElement
}

export const bulkActionsTypeTabs: BulkActionsTabs[] = [
  {
    id: BulkActionsType.Delete,
    label: (
      <>
        <RiIcon type="DeleteIcon" />
        Delete Keys
      </>
    ),
  },
  {
    id: BulkActionsType.Upload,
    label: (
      <>
        <RiIcon type="BulkUploadIcon" />
        Upload Data
      </>
    ),
  },
]
