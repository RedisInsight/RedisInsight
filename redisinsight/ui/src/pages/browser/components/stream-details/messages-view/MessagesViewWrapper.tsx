import { EuiText } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { selectedConsumerSelector } from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'
import { PendingEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import MessagesView from './MessagesView'

import styles from './MessagesView/styles.module.scss'

const actionsWidth = 50
const minColumnWidth = 190
const suffix = '_stream_messages'

export interface Props {
  isFooterOpen: boolean
}

const MessagesViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedMessages = []
  } = useSelector(selectedConsumerSelector) ?? {}

  const [claiming, setClaiming] = useState<string>('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [])

  const closePopover = useCallback(() => {
    setClaiming('')
  }, [])

  const showPopover = useCallback((consumer = '') => {
    setClaiming(`${consumer + suffix}`)
  }, [])

  const columns: ITableColumn[] = [
    {
      id: 'id',
      label: 'Entry ID',
      absoluteWidth: minColumnWidth,
      minWidth: minColumnWidth,
      isSortable: true,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      render: function Id(_name: string, { id }: PendingEntryDto) {
        const timestamp = id.split('-')?.[0]
        return (
          <div>
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
              <div className="truncateText streamItem" style={{ display: 'flex' }} data-testid={`stream-message-${id}-date`}>
                {getFormatTime(timestamp)}
              </div>
            </EuiText>
            <EuiText size="s" style={{ maxWidth: '100%' }}>
              <div className="streamItemId" data-testid={`stream-message-${id}`}>
                {id}
              </div>
            </EuiText>
          </div>
        )
      },
    },
    {
      id: 'idle',
      label: 'Last Message Delivered',
      minWidth: 256,
      absoluteWidth: 106,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
    },
    {
      id: 'delivered',
      label: 'Times Message Delivered',
      minWidth: 106,
      absoluteWidth: 106,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'streamItemHeader',
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      maxWidth: actionsWidth,
      minWidth: actionsWidth,
      render: function Actions(_act: any, { id }: PendingEntryDto) {
        return (
          <div />
        )
      },
    },
  ]

  return (
    <>
      <MessagesView
        data={loadedMessages}
        columns={columns}
        onClosePopover={closePopover}
        {...props}
      />
    </>
  )
}

export default MessagesViewWrapper
