import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  setStreamViewType,
  selectedGroupSelector,
  setSelectedConsumer,
  fetchConsumerMessages,
  deleteConsumersAction
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { TableCellAlignment, TableCellTextAlignment } from 'uiSrc/constants'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { selectedKeyDataSelector, updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'

import { ConsumerDto } from 'apiSrc/modules/browser/dto/stream.dto'
import ConsumersView from './ConsumersView'

import styles from './ConsumersView/styles.module.scss'

const suffix = '_stream_consumer'
const actionsWidth = 50

export interface Props {
  isFooterOpen: boolean
}

const ConsumersViewWrapper = (props: Props) => {
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const {
    name: selectedGroupName = '',
    lastRefreshTime,
    data: loadedConsumers = [],
  } = useSelector(selectedGroupSelector) ?? {}

  const dispatch = useDispatch()

  const [deleting, setDeleting] = useState<string>('')

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((consumer = '') => {
    setDeleting(`${consumer + suffix}`)
  }, [])

  const handleDeleteConsumer = (consumerName = '') => {
    dispatch(deleteConsumersAction(key, selectedGroupName, [consumerName]))
    closePopover()
  }

  const handleRemoveIconClick = () => {
    // sendEventTelemetry({
    //   event: getBasedOnViewTypeEvent(
    //     viewType,
    //     TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
    //     TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED
    //   ),
    //   eventData: {
    //     databaseId: instanceId,
    //     keyType: KeyTypes.Stream
    //   }
    // })
  }

  const handleSelectConsumer = ({ rowData }: { rowData: any }) => {
    dispatch(setSelectedConsumer(rowData))
    dispatch(fetchConsumerMessages(
      false,
      () => dispatch(setStreamViewType(StreamViewType.Messages))
    ))
  }

  const columns: ITableColumn[] = [

    {
      id: 'name',
      label: 'Consumer Name',
      relativeWidth: 0.59,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
    },
    {
      id: 'pending',
      label: 'Pending',
      minWidth: 106,
      relativeWidth: 0.12,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
    },
    {
      id: 'idle',
      label: 'Idle Time, ms',
      minWidth: 190,
      relativeWidth: 0.27,
      isSortable: true,
      alignment: TableCellAlignment.Right,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: (cellData: number) => numberWithSpaces(cellData),
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'streamItemHeader',
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      maxWidth: actionsWidth,
      minWidth: actionsWidth,
      render: function Actions(_act: any, { name }: ConsumerDto) {
        return (
          <div>
            <PopoverDelete
              header={name}
              text={(
                <>
                  will be removed from Consumer Group <b>{selectedGroupName}</b>
                </>
              )}
              item={name}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-consumer-button-${name}`}
              handleDeleteItem={() => handleDeleteConsumer(name)}
              handleButtonClick={handleRemoveIconClick}
            />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <ConsumersView
        data={loadedConsumers}
        columns={columns}
        onClosePopover={closePopover}
        onSelectConsumer={handleSelectConsumer}
        {...props}
      />
    </>
  )
}

export default ConsumersViewWrapper
