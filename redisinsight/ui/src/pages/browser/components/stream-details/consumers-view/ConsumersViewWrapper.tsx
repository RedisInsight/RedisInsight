import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  deleteStreamEntry,
  setStreamViewType,
  selectedGroupSelector,
  setSelectedConsumer,
  fetchConsumerMessages
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import { ConsumerDto } from 'apiSrc/modules/browser/dto/stream.dto'
import ConsumersView from './ConsumersView'

import styles from './ConsumersView/styles.module.scss'

const suffix = '_stream_consumer'
const actionsWidth = 50
const minColumnWidth = 190

interface Props {
  isFooterOpen: boolean
}

const ConsumersViewWrapper = (props: Props) => {
  const {
    data: loadedConsumers = [],
  } = useSelector(selectedGroupSelector) ?? {}
  const { id: instanceId, name: key = '' } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  const [consumers, setConsumers] = useState<ConsumerDto[]>(loadedConsumers)
  const [deleting, setDeleting] = useState<string>('')

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((consumer = '') => {
    setDeleting(`${consumer + suffix}`)
  }, [])

  const handleDeleteConsumer = (consumerName = '') => {
    dispatch(deleteStreamEntry(key, [consumerName]))
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
      // minWidth: 180,
      truncateText: true,
      isSortable: true,
    },
    {
      id: 'pending',
      label: 'Pending',
      minWidth: 106,
      absoluteWidth: 106,
      truncateText: true,
      isSortable: true,
    },
    {
      id: 'idle',
      label: 'Idle time, ms',
      absoluteWidth: 190,
      minWidth: 190,
      isSortable: true,
      className: styles.cell,
      headerClassName: styles.cellHeader,
      render: (cellData: number) => numberWithSpaces(cellData),
    },
    {
      id: 'actions',
      label: '',
      headerClassName: styles.actionsHeader,
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      maxWidth: actionsWidth,
      minWidth: actionsWidth,
      render: function Actions(_act: any, { name }: ConsumerDto) {
        return (
          <div>
            <PopoverDelete
              text={(
                <>
                  Consumer will be removed from
                  <br />
                  {key}
                </>
              )}
              item={name}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-consumer-button-${name}`}
              handleDeleteItem={handleDeleteConsumer}
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
        data={consumers}
        columns={columns}
        onClosePopover={closePopover}
        onSelectConsumer={handleSelectConsumer}
        {...props}
      />
    </>
  )
}

export default ConsumersViewWrapper
