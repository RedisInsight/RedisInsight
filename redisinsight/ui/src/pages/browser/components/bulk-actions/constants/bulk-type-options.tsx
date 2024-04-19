import { EuiIcon } from '@elastic/eui'
import React from 'react'
import { BulkActionsType } from 'uiSrc/constants'
import BulkUpload from 'uiSrc/assets/img/icons/bulk-upload.svg?react'

interface BulkActionsTabs {
  id: BulkActionsType,
  label: React.ReactElement | string,
  separator?: React.ReactElement
}

export const bulkActionsTypeTabs: BulkActionsTabs[] = [
  {
    id: BulkActionsType.Delete,
    label: <><EuiIcon type="trash" />Delete Keys</>,
  },
  {
    id: BulkActionsType.Upload,
    label: <><EuiIcon type={BulkUpload} />Upload Data</>,
  },
]
