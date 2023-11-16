import React from 'react'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

export const MAX_FORMAT_LENGTH_STREAM_TIMESTAMP = 16
export const MAX_VISIBLE_LENGTH_STREAM_TIMESTAMP = 25

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
