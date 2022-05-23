import { EuiText } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  deleteStreamEntry,
  fetchConsumers,
  setStreamViewType,
  selectedGroupSelector,
  setSelectedConsumer
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import ConsumersView from './ConsumersView'

import styles from './ConsumersView/styles.module.scss'

export interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

const suffix = '_stream_consumers'
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

  const [consumers, setConsumers] = useState<IStreamEntry[]>([])
  const [deleting, setDeleting] = useState<string>('')

  useEffect(() => {
    dispatch(fetchConsumers())
  }, [])

  useEffect(() => {
    const streamConsumers: IStreamEntry[] = loadedConsumers?.map((item) => ({
      ...item,
      editing: false,
    }))

    setConsumers(streamConsumers)
  }, [loadedConsumers, deleting])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((entry = '') => {
    setDeleting(`${entry + suffix}`)
  }, [])

  const handleDeleteConsumer = (entryId = '') => {
    dispatch(deleteStreamEntry(key, [entryId]))
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

  const handleEditConsumer = (consumerId = '', editing: boolean) => {
    const newConsumersState = consumers.map((item) => {
      if (item.id === consumerId) {
        return { ...item, editing }
      }
      return item
    })
    setConsumers(newConsumersState)
  }

  const handleSelectConsumer = ({ rowData }: { rowData: any }) => {
    dispatch(setSelectedConsumer(rowData))
    dispatch(fetchConsumers(
      true,
      () => dispatch(setStreamViewType(StreamViewType.Groups))
    ))
  }

  const columns: ITableColumn[] = [

    {
      id: 'name',
      label: 'Consumer Name',
      // minWidth: 180,
      truncateText: true,
      isSortable: true,
      // render: (cellData: ConnectionType) =>
      //   capitalize(cellData),
    },
    {
      id: 'pending',
      label: 'Pending',
      minWidth: 106,
      absoluteWidth: 106,
      truncateText: true,
      isSortable: true,
      // render: (cellData: ConnectionType) =>
      //   capitalize(cellData),
    },
    {
      id: 'time',
      label: 'Idle time, ms',
      absoluteWidth: 190,
      minWidth: 190,
      isSortable: true,
      className: styles.cell,
      headerClassName: styles.cellHeader,
      render: function Id(_name: string, { lastDeliveredId: id }: StreamEntryDto) {
        const timestamp = id?.split('-')?.[0]
        return (
          <div>
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
              <div className="truncateText streamConsumer" style={{ display: 'flex' }} data-testid={`stream-consumer-${id}-date`}>
                {getFormatTime(timestamp)}
              </div>
            </EuiText>
            <EuiText size="s" style={{ maxWidth: '100%' }}>
              <div className="streamConsumerId" data-testid={`stream-consumer-${id}`}>
                {id}
              </div>
            </EuiText>
          </div>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      headerClassName: styles.actionsHeader,
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      maxWidth: actionsWidth,
      minWidth: actionsWidth,
      render: function Actions(_act: any, { id }: StreamEntryDto) {
        return (
          <div>
            <PopoverDelete
              text={(
                <>
                  Consumers will be removed from
                  <br />
                  {key}
                </>
              )}
              item={id}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-consumers-button-${id}`}
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
        onEditConsumer={handleEditConsumer}
        onClosePopover={closePopover}
        onSelectConsumer={handleSelectConsumer}
        {...props}
      />
    </>
  )
}

export default ConsumersViewWrapper
