import { EuiText } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { selectedConsumerSelector, selectedGroupSelector, ackPendingEntriesAction, claimPendingMessages } from 'uiSrc/slices/browser/stream'
import { selectedKeyDataSelector, updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { PendingEntryDto, ClaimPendingEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import MessagesView from './MessagesView'
import MessageClaimPopover from './MessageClaimPopover'
import MessageAckPopover from './MessageAckPopover'

import styles from './MessagesView/styles.module.scss'

const actionsWidth = 150
const minColumnWidth = 190

export interface Props {
  isFooterOpen: boolean
}

const MessagesViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedMessages = []
  } = useSelector(selectedConsumerSelector) ?? {}
  const { name: group } = useSelector(selectedGroupSelector) ?? { name: '' }
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const [claimingId, setClaimingId] = useState<string>('')
  const [acknowledgeId, setAcknowledgeId] = useState<string>('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [])

  const closePopover = useCallback(() => {
    setClaimingId('')
  }, [])

  const showPopover = useCallback((consumer = '') => {
    setClaimingId(consumer)
  }, [])

  const showAchPopover = useCallback((id) => {
    setAcknowledgeId(id)
  }, [])

  const closeAckPopover = useCallback(() => {
    setAcknowledgeId('')
  }, [])

  const handleAchPendingMessage = (entry: string) => {
    dispatch(ackPendingEntriesAction(key, group, [entry], closeAckPopover))
  }

  const handleClaimingId = (data: ClaimPendingEntryDto, successAction: () => void) => {
    dispatch(claimPendingMessages(data, successAction))
  }

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
              closePopover={() => closePopover()}
              showPopover={() => showPopover(id)}
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
        columns={columns}
        onClosePopover={closePopover}
        {...props}
      />
    </>
  )
}

export default MessagesViewWrapper
