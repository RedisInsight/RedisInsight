import React from 'react'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { Maybe } from 'uiSrc/utils'

interface StreamTabs {
  id: StreamViewType,
  label: string,
  separator?: Maybe<React.ReactElement>
}

export const streamViewTypeTabs: StreamTabs[] = [
  {
    id: StreamViewType.Data,
    label: 'Stream data',
  },
  {
    id: StreamViewType.Groups,
    label: 'Consumer Groups',
  },
]
