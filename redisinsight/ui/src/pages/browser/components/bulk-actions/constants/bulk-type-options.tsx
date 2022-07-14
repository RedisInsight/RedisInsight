import { EuiIcon } from '@elastic/eui'
import React from 'react'
import { BulkActionsType } from 'uiSrc/constants'

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
]
