import { EuiFieldText, EuiIcon, EuiSpacer, EuiText, EuiToolTip } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PopoverItemEditor from 'uiSrc/components/popover-item-editor'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'

import {
  streamGroupsSelector,
  deleteStreamEntry,
  fetchConsumerGroups,
  setSelectedGroup,
  fetchConsumers,
  setStreamViewType,
  modifyLastDeliveredIdAction
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { KeyTypes, TableCellTextAlignment } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConsumerGroupDto, StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import GroupsView from './GroupsView'

import styles from './GroupsView/styles.module.scss'

export interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

const suffix = '_stream_groups'
const actionsWidth = 80
const minColumnWidth = 190

interface Props {
  isFooterOpen: boolean
}

const GroupsViewWrapper = (props: Props) => {
  const {
    data: loadedGroups = [],
  } = useSelector(streamGroupsSelector)
  const { id: instanceId, name: key = '' } = useSelector(connectedInstanceSelector)
  const { name: selectedKey } = useSelector(selectedKeyDataSelector)

  const dispatch = useDispatch()

  const [groups, setGroups] = useState<ConsumerGroupDto[]>([])
  const [deleting, setDeleting] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')

  useEffect(() => {
    dispatch(fetchConsumerGroups())
  }, [])

  useEffect(() => {
    const streamGroups: ConsumerGroupDto[] = loadedGroups?.map((item) => ({
      ...item,
      editing: false,
    }))

    setGroups(streamGroups)
  }, [loadedGroups, deleting])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((entry = '') => {
    setDeleting(`${entry + suffix}`)
  }, [])

  const handleDeleteGroup = (entryId = '') => {
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

  const handleSelectGroup = ({ rowData }: { rowData: any }) => {
    dispatch(setSelectedGroup(rowData))
    dispatch(fetchConsumers(
      true,
      () => dispatch(setStreamViewType(StreamViewType.Consumers))
    ))
  }

  const handleApplyEditId = (groupName: string) => {
    const data = {
      keyName: selectedKey,
      name: groupName,
      lastDeliveredId: editValue
    }
    dispatch(modifyLastDeliveredIdAction(data))
  }

  const columns: ITableColumn[] = [

    {
      id: 'name',
      label: 'Group Name',
      // minWidth: 180,
      truncateText: true,
      isSortable: true,
      // render: (cellData: ConnectionType) =>
      //   capitalize(cellData),
    },
    {
      id: 'consumers',
      label: 'Consumers',
      minWidth: 130,
      absoluteWidth: 130,
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
      id: 'lastDeliveredId',
      label: 'Last Delivered ID',
      absoluteWidth: 190,
      minWidth: 190,
      isSortable: true,
      className: styles.cell,
      headerClassName: styles.cellHeader,
      render: function Id(_name: string, { lastDeliveredId: id }: ConsumerGroupDto) {
        const timestamp = id?.split('-')?.[0]
        return (
          <div>
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
              <div className="truncateText streamGroup" style={{ display: 'flex' }} data-testid={`stream-group-${id}-date`}>
                {getFormatTime(timestamp)}
              </div>
            </EuiText>
            <EuiText size="s" style={{ maxWidth: '100%' }}>
              <div className="streamGroupId" data-testid={`stream-group-${id}`}>
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
      render: function Actions(_act: any, { lastDeliveredId, name }: ConsumerGroupDto) {
        return (
          <div>
            <PopoverItemEditor
              btnTestId={`edit-stream-last-id-${lastDeliveredId}`}
              onOpen={() => setEditValue(lastDeliveredId)}
              onApply={() => handleApplyEditId(name)}
              className={styles.editLastId}
            >
              <EuiFieldText
                fullWidth
                name="id"
                id="id"
                placeholder="ID*"
                value={editValue}
                onChange={(e: any) => setEditValue(e.target.value)}
                append={(
                  <EuiToolTip
                    anchorClassName="inputAppendIcon"
                    className={styles.entryIdTooltip}
                    position="left"
                    title="Enter Valid ID, 0 or $"
                    content={(
                      <>
                        Specify the ID of the last delivered entry in the stream from the new group's perspective.
                        <EuiSpacer size="xs" />
                        Otherwise, <b>$</b> represents the ID of the last entry in the stream,&nbsp;
                        <b>0</b> fetches the entire stream from the beginning.
                      </>
                    )}
                  >
                    <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
                  </EuiToolTip>
                )}
                style={{ width: 240 }}
                autoComplete="off"
                data-testid="id-field"
              />
            </PopoverItemEditor>
            <PopoverDelete
              text={(
                <>
                  Groups will be removed from
                  <br />
                  {key}
                </>
              )}
              item={lastDeliveredId}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-groups-button-${lastDeliveredId}`}
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
        onClosePopover={closePopover}
        onSelectGroup={handleSelectGroup}
        {...props}
      />
    </>
  )
}

export default GroupsViewWrapper
