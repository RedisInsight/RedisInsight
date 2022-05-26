import { EuiText } from '@elastic/eui'
import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'

import { selectedConsumerSelector } from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { PendingEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import MessagesView from './MessagesView'

import styles from './MessagesView/styles.module.scss'

const actionsWidth = 50
const minColumnWidth = 190
const suffix = '_stream_messages'

interface Props {
  isFooterOpen: boolean
}

const MessagesViewWrapper = (props: Props) => {
  const {
    data: loadedMessages = [],
  } = useSelector(selectedConsumerSelector) ?? {}

  const [messages, setMessages] = useState<PendingEntryDto[]>(loadedMessages)
  const [claiming, setClaiming] = useState<string>('')

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
      headerClassName: styles.cellHeader,
      render: function Id(_name: string, { id }: PendingEntryDto) {
        const timestamp = id.split('-')?.[0]
        return (
          <div>
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
              <div className="truncateText streamEntry" style={{ display: 'flex' }} data-testid={`stream-entry-${id}-date`}>
                {getFormatTime(timestamp)}
              </div>
            </EuiText>
            <EuiText size="s" style={{ maxWidth: '100%' }}>
              <div className="streamEntryId" data-testid={`stream-entry-${id}`}>
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
      // render: (cellData: ConnectionType) =>
      //   capitalize(cellData),
    },
    {
      id: 'delivered',
      label: 'Times Message Delivered',
      minWidth: 106,
      absoluteWidth: 106,
      truncateText: true,
      isSortable: true,
      // render: (cellData: ConnectionType) =>
      //   capitalize(cellData),
    },
    {
      id: 'actions',
      label: '',
      headerClassName: styles.actionsHeader,
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
        data={messages}
        columns={columns}
        onClosePopover={closePopover}
        {...props}
      />
    </>
  )
}

export default MessagesViewWrapper
