import { EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { keyBy } from 'lodash'

import { formatLongName } from 'uiSrc/utils'
import { streamDataSelector } from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { KeyTypes, TableCellTextAlignment } from 'uiSrc/constants'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'
import StreamDetails from './StreamDetails'

import styles from './StreamDetails/styles.module.scss'
import PopoverDelete from '../popover-delete/PopoverDelete'

export interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

const suffix = '_stream'
const actionsWidth = 50
const minColumnWidth = 190

const StreamDetailsWrapper = () => {
  const dispatch = useDispatch()

  const {
    entries: loadedEntries = [],
    keyName: key
  } = useSelector(streamDataSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [uniqFields, setUniqFields] = useState({})
  const [entries, setEntries] = useState<IStreamEntry[]>([])
  const [columns, setColumns] = useState<ITableColumn[]>([])
  const [deleting, setDeleting] = useState('')

  useEffect(() => {
    let fields = {}
    const streamEntries: IStreamEntry[] = loadedEntries?.map((item) => {
      fields = {
        ...fields,
        ...keyBy(Object.keys(item.fields))
      }

      return {
        ...item,
        editing: false,
      }
    })

    setUniqFields(fields)
    setEntries(streamEntries)
    setColumns([...defaultColumns, ...Object.keys(fields).map((field) => getTemplateColumn(field))])
  }, [loadedEntries])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((field = '') => {
    setDeleting(`${field + suffix}`)
  }, [])

  const handleDeleteEntry = (entryId = '') => {
    // dispatch(deleteStreamEntry(key, [field]))
    closePopover()
  }

  const handleRemoveIconClick = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Stream
      }
    })
  }

  const handleEditEntry = (entryId = '', editing: boolean) => {
    const newFieldsState = entries.map((item) => {
      if (item.id === entryId) {
        return { ...item, editing }
      }
      return item
    })
    setEntries(newFieldsState)
  }

  const getTemplateColumn = (label: string) : ITableColumn => ({
    id: label,
    label,
    minWidth: minColumnWidth,
    isSortable: false,
    className: styles.cell,
    headerClassName: styles.cellHeader,
    headerCellClassName: 'truncateText',
    render: function Id(_name: string, { id, fields }: StreamEntryDto) {
      const value = fields[label] ?? ''
      const cellContent = value.substring(0, 200)
      const tooltipContent = formatLongName(value)

      return (
        <EuiText size="s" style={{ maxWidth: '100%' }}>
          <div
            style={{ display: 'flex' }}
            className="streamEntry"
            data-testid={`stream-entry-field-${id}`}
          >
            <EuiToolTip
              title="Value"
              className={styles.tooltip}
              anchorClassName="streamEntry line-clamp-2"
              position="bottom"
              content={tooltipContent}
            >
              <>{cellContent}</>
            </EuiToolTip>
          </div>
        </EuiText>
      )
    }
  })

  const defaultColumns: ITableColumn[] = [
    {
      id: 'id',
      label: 'Entry ID',
      absoluteWidth: minColumnWidth,
      minWidth: minColumnWidth,
      isSortable: true,
      className: styles.cell,
      headerClassName: styles.cellHeader,
      render: function Id(_name: string, { id }: StreamEntryDto) {
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
    // {
    //   id: 'value',
    //   label: 'Value',
    //   truncateText: true,
    //   render: function Value(
    //     _name: string,
    //     { field, value, editing }: IStreamEntry
    //   ) {
    //     // Better to cut the long string, because it could affect virtual scroll performance
    //     const cellContent = value.substring(0, 200)
    //     const tooltipContent = formatLongName(value)
    //     if (editing) {
    //       return (
    //         <InlineItemEditor
    //           initialValue={value}
    //           controlsPosition="right"
    //           placeholder="Enter Value"
    //           fieldName="fieldValue"
    //           expandable
    //           isLoading={updateLoading}
    //           onDecline={() => handleEditField(field, false)}
    //           onApply={(value) => handleApplyEditField(field, value)}
    //         />
    //       )
    //     }
    //     return (
    //       <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
    //         <div
    //           style={{ display: 'flex' }}
    //           className="truncateText"
    //           data-testid={`stream-entry-value-${field}`}
    //         >
    //           <EuiToolTip
    //             title="Value"
    //             className={styles.tooltip}
    //             anchorClassName="truncateText"
    //             position="bottom"
    //             content={tooltipContent}
    //           >
    //             <>{cellContent}</>
    //           </EuiToolTip>
    //         </div>
    //       </EuiText>
    //     )
    //   },
    // },
    {
      id: 'actions',
      label: <EuiButtonIcon iconType="boxesVertical" aria-label="manage columns" />,
      headerClassName: styles.actionsHeader,
      className: styles.actions,
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      render: function Actions(_act: any, { id }: StreamEntryDto) {
        return (
          <div className={cx('value-table-actions', 'stream-entry-actions')}>
            {/* <EuiButtonIcon
              iconType="pencil"
              aria-label="Edit Entry"
              className="editFieldBtn"
              color="primary"
              // disabled={updateLoading}
              onClick={() => handleEditEntry(id, true)}
              data-testid={`edit-entry-button-${id}`}
            /> */}
            <PopoverDelete
              item={id}
              keyName={key}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-entry-button-${id}`}
              handleDeleteItem={handleDeleteEntry}
              handleButtonClick={handleRemoveIconClick}
            />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <StreamDetails
        data={entries}
        columns={columns}
        onEditEntry={handleEditEntry}
        onClosePopover={closePopover}
      />
    </>
  )
}

export default StreamDetailsWrapper
