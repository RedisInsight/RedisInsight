import React from 'react'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

interface StreamTabs {
  id: StreamViewType,
  label: string,
  separator?: React.ReactElement
}

export const streamViewTypeTabs: StreamTabs[] = [
  {
    id: StreamViewType.Data,
    label: 'Stream Data',
  },
  {
    id: StreamViewType.Groups,
    label: 'Consumer Groups',
  },
]
