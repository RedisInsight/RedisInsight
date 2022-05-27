import { EuiText, EuiToolTip } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  streamGroupsSelector,
  setSelectedGroup,
  fetchConsumers,
  setStreamViewType,
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'
import { ConsumerGroupDto } from 'apiSrc/modules/browser/dto/stream.dto'

import GroupsView from './GroupsView'

import styles from './GroupsView/styles.module.scss'

export interface IConsumerGroup extends ConsumerGroupDto {
  editing: boolean
}

const suffix = '_stream_group'
const actionsWidth = 50

export interface Props {
  isFooterOpen: boolean
}

const GroupsViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedGroups = [],
  } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  const [groups, setGroups] = useState<IConsumerGroup[]>([])
  const [deleting, setDeleting] = useState<string>('')

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [lastRefreshTime])

  useEffect(() => {
    const streamItem: IConsumerGroup[] = loadedGroups?.map((item) => ({
      ...item,
      editing: false,
    }))

    setGroups(streamItem)
  }, [loadedGroups, deleting])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((groupName = '') => {
    setDeleting(`${groupName + suffix}`)
  }, [])

  const handleDeleteGroup = () => {
    // dispatch(deleteStreamEntry(key, [groupName]))
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

  const handleEditGroup = (groupId = '', editing: boolean) => {
    const newGroupsState = groups.map((item) => {
      if (item.name === groupId) {
        return { ...item, editing }
      }
      return item
    })
    setGroups(newGroupsState)
  }

  const handleSelectGroup = ({ rowData }: { rowData: any }) => {
    dispatch(setSelectedGroup(rowData))
    dispatch(fetchConsumers(
      false,
      () => dispatch(setStreamViewType(StreamViewType.Consumers))
    ))
  }

  const columns: ITableColumn[] = [

    {
      id: 'name',
      label: 'Group Name',
      truncateText: true,
      isSortable: true,
      relativeWidth: 0.44,
      headerClassName: 'streamItemHeader',
    },
    {
      id: 'consumers',
      label: 'Consumers',
      minWidth: 130,
      relativeWidth: 0.15,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
    },
    {
      id: 'pending',
      label: 'Pending',
      minWidth: 106,
      relativeWidth: 0.12,
      isSortable: true,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      render: function P(_name: string, { pending, greatestPendingId, smallestPendingId, name }: ConsumerGroupDto) {
        const smallestTimestamp = smallestPendingId?.split('-')?.[0]
        const greatestTimestamp = greatestPendingId?.split('-')?.[0]

        const tooltipContent = `${getFormatTime(smallestTimestamp)} – ${getFormatTime(greatestTimestamp)}`
        return (
          <EuiText size="s" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex' }} className="truncateText" data-testid={`group-pending-${name}`}>
              {!!pending && (
                <EuiToolTip
                  title={`${pending} Pending Messages`}
                  className={styles.tooltip}
                  anchorClassName="truncateText"
                  position="bottom"
                  content={tooltipContent}
                >
                  <>{pending}</>
                </EuiToolTip>
              )}
              {!pending && pending}
            </div>
          </EuiText>
        )
      },
    },
    {
      id: 'lastDeliveredId',
      label: 'Last Delivered ID',
      relativeWidth: 0.25,
      minWidth: 190,
      isSortable: true,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      render: function Id(_name: string, { lastDeliveredId: id }: ConsumerGroupDto) {
        const timestamp = id?.split('-')?.[0]
        return (
          <div>
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
              <div className="truncateText streamItem" style={{ display: 'flex' }} data-testid={`stream-group-${id}-date`}>
                {getFormatTime(timestamp)}
              </div>
            </EuiText>
            <EuiText size="s" style={{ maxWidth: '100%' }}>
              <div className="streamItemId" data-testid={`stream-group-${id}`}>
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
      render: function Actions(_act: any, { name }: ConsumerGroupDto) {
        return (
          <div>
            <PopoverDelete
              text={(
                <>
                  Group will be removed from
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
              testid={`remove-groups-button-${name}`}
              handleDeleteItem={handleDeleteGroup}
              handleButtonClick={handleRemoveIconClick}
            />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <GroupsView
        data={groups}
        columns={columns}
        onEditGroup={handleEditGroup}
        onClosePopover={closePopover}
        onSelectGroup={handleSelectGroup}
        {...props}
      />
    </>
  )
}

export default GroupsViewWrapper
