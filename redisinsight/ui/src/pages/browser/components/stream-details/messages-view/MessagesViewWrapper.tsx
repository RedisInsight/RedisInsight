import { EuiText } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { last, toNumber } from 'lodash'

import {
  fetchMoreConsumerMessages,
  selectedConsumerSelector,
  selectedGroupSelector,
  ackPendingEntriesAction,
  claimPendingMessages
} from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector, updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime, getNextId } from 'uiSrc/utils/streamUtils'
import { SortOrder, TableCellTextAlignment } from 'uiSrc/constants'
import { PendingEntryDto, ClaimPendingEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'

import MessagesView from './MessagesView'
import MessageClaimPopover from './MessageClaimPopover'
import MessageAckPopover from './MessageAckPopover'

import styles from './MessagesView/styles.module.scss'

const actionsWidth = 150
const minColumnWidth = 195

export interface Props {
  isFooterOpen: boolean
}

const MessagesViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedMessages = [],
    pending = 0
  } = useSelector(selectedConsumerSelector) ?? {}
  const { name: group } = useSelector(selectedGroupSelector) ?? { name: '' }
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const [claimingId, setClaimingId] = useState<string>('')
  const [acknowledgeId, setAcknowledgeId] = useState<string>('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [])

  const showAchPopover = useCallback((id) => {
    setAcknowledgeId(id)
  }, [])

  const closeAckPopover = useCallback(() => {
    setAcknowledgeId('')
  }, [])

  const showClaimPopover = useCallback((id :string) => {
    setClaimingId(id)
  }, [])

  const closeClaimPopover = useCallback(() => {
    setClaimingId('')
  }, [])

  const closePopovers = useCallback(() => {
    setClaimingId('')
    setAcknowledgeId('')
  }, [])

  const handleAchPendingMessage = (entry: string) => {
    dispatch(ackPendingEntriesAction(key, group, [entry], closeAckPopover))
  }

  const handleClaimingId = (data: Partial<ClaimPendingEntryDto>, successAction: () => void) => {
    dispatch(claimPendingMessages(data, successAction))
  }
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
      className: styles.actionCell,
      minWidth: actionsWidth,
      absoluteWidth: actionsWidth,
      render: function Actions(_act: any, { id }: PendingEntryDto) {
        return (
          <div>
            <MessageAckPopover
              id={id}
              isOpen={acknowledgeId === id}
              closePopover={() => closeAckPopover()}
              showPopover={() => showAchPopover(id)}
              acknowledge={handleAchPendingMessage}
            />
            <MessageClaimPopover
              id={id}
              isOpen={claimingId === id}
              closePopover={() => closeClaimPopover()}
              showPopover={() => showClaimPopover(id)}
              claimMessage={handleClaimingId}
            />
          </div>
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
        onClosePopover={closePopovers}
        loadMoreItems={loadMoreItems}
        {...props}
      />
    </>
  )
}

export default MessagesViewWrapper
