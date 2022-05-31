import { EuiText } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { last, toNumber } from 'lodash'

import { fetchMoreConsumerMessages, selectedConsumerSelector } from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime, getNextId } from 'uiSrc/utils/streamUtils'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder, TableCellTextAlignment } from 'uiSrc/constants'
import { updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'
import { PendingEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import MessagesView from './MessagesView'

import styles from './MessagesView/styles.module.scss'

const actionsWidth = 50
const minColumnWidth = 195
const suffix = '_stream_messages'

export interface Props {
  isFooterOpen: boolean
}

const MessagesViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedMessages = [],
    pending = 0
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

  const loadMoreItems = useCallback(() => {
    const lastLoadedEntryId = last(loadedMessages)?.id ?? '-'
    const nextId = `(${getNextId(lastLoadedEntryId, SortOrder.ASC)}`

    dispatch(fetchMoreConsumerMessages(SCAN_COUNT_DEFAULT, nextId))
  }, [loadedMessages])

  const columns: ITableColumn[] = [
    {
      id: 'id',
      label: 'Entry ID',
      absoluteWidth: minColumnWidth,
      minWidth: minColumnWidth,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      render: function Id(_name: string, { id }: PendingEntryDto) {
        const timestamp = id?.split('-')?.[0]
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
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: function Idle(_name: string, { id, idle }: PendingEntryDto) {
        const timestamp = id?.split('-')?.[0]
        return (
          <div>
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
              <div
                className="truncateText streamItem"
                data-testid={`stream-message-${id}-idle`}
              >
                {getFormatTime(`${toNumber(timestamp) + idle}`)}
              </div>
            </EuiText>
          </div>
        )
      },
    },
    {
      id: 'delivered',
      label: 'Times Message Delivered',
      minWidth: 106,
      absoluteWidth: 106,
      truncateText: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
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
        total={pending}
        columns={columns}
        onClosePopover={closePopover}
        loadMoreItems={loadMoreItems}
        {...props}
      />
    </>
  )
}

export default MessagesViewWrapper
