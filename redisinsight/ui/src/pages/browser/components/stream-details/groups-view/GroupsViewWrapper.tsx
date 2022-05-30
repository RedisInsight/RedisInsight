import { EuiFieldText, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PopoverItemEditor from 'uiSrc/components/popover-item-editor'
import { lastDeliveredIDTooltipText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector, updateSelectedKeyRefreshTime } from 'uiSrc/slices/browser/keys'

import {
  streamGroupsSelector,
  setSelectedGroup,
  fetchConsumers,
  setStreamViewType,
  modifyLastDeliveredIdAction,
  deleteConsumerGroupsAction,
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { consumerGroupIdRegex, validateConsumerGroupId } from 'uiSrc/utils'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

import { ConsumerGroupDto, UpdateConsumerGroupDto } from 'apiSrc/modules/browser/dto/stream.dto'

import GroupsView from './GroupsView'

import styles from './GroupsView/styles.module.scss'

export interface IConsumerGroup extends ConsumerGroupDto {
  editing: boolean
}

const suffix = '_stream_group'
const actionsWidth = 80

export interface Props {
  isFooterOpen: boolean
}

const GroupsViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedGroups = [],
    loading
  } = useSelector(streamGroupsSelector)
  const { name: selectedKey } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const dispatch = useDispatch()

  const [groups, setGroups] = useState<IConsumerGroup[]>([])
  const [deleting, setDeleting] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')
  const [idError, setIdError] = useState<string>('')
  const [isIdFocused, setIsIdFocused] = useState<boolean>(false)

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

  useEffect(() => {
    if (!consumerGroupIdRegex.test(editValue)) {
      setIdError('ID format is not correct')
      return
    }
    setIdError('')
  }, [editValue])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((groupName = '') => {
    setDeleting(`${groupName + suffix}`)
  }, [])

  const handleDeleteGroup = (name: string) => {
    dispatch(deleteConsumerGroupsAction(selectedKey, [name]))
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
      false,
      () => dispatch(setStreamViewType(StreamViewType.Consumers))
    ))
  }

  const handleApplyEditId = (groupName: string) => {
    if (!!groupName.length && !idError && selectedKey) {
      const data: UpdateConsumerGroupDto = {
        keyName: selectedKey,
        name: groupName,
        lastDeliveredId: editValue
      }
      dispatch(modifyLastDeliveredIdAction(data))
    }
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
      render: function Actions(_act: any, { lastDeliveredId, name }: ConsumerGroupDto) {
        const showIdError = !isIdFocused && idError
        return (
          <div>
            <PopoverItemEditor
              btnTestId={`edit-stream-last-id-${lastDeliveredId}`}
              onOpen={() => setEditValue(lastDeliveredId)}
              onApply={() => handleApplyEditId(name)}
              className={styles.editLastId}
              isDisabled={!editValue.length || !!idError}
              isLoading={loading}
            >
              <>
                <EuiFieldText
                  fullWidth
                  name="id"
                  id="id"
                  placeholder="ID*"
                  value={editValue}
                  onChange={(e: any) => setEditValue(validateConsumerGroupId(e.target.value))}
                  onBlur={() => setIsIdFocused(false)}
                  onFocus={() => setIsIdFocused(true)}
                  append={(
                    <EuiToolTip
                      anchorClassName="inputAppendIcon"
                      position="left"
                      title="Enter Valid ID, 0 or $"
                      content={lastDeliveredIDTooltipText}
                    >
                      <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
                    </EuiToolTip>
                  )}
                  style={{ width: 240 }}
                  autoComplete="off"
                  data-testid="last-id-field"
                />
                {!showIdError && <span className={styles.idText} data-testid="id-help-text">Timestamp - Sequence Number or $</span>}
                {showIdError && <span className={styles.error} data-testid="id-error">{idError}</span>}
              </>
            </PopoverItemEditor>
            <PopoverDelete
              header={name}
              text={(
                <>
                  will be removed from <b>{selectedKey}</b>
                </>
              )}
              item={name}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-groups-button-${name}`}
              handleDeleteItem={() => handleDeleteGroup(name)}
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
