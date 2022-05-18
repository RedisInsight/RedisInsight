import { EuiText, EuiToolTip } from '@elastic/eui'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { keyBy } from 'lodash'

import { formatLongName } from 'uiSrc/utils'
import { streamDataSelector, deleteStreamEntry } from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { getFormatTime } from 'uiSrc/utils/streamUtils'
import { KeyTypes, TableCellTextAlignment } from 'uiSrc/constants'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import StreamDetails from './StreamDetails'

import styles from './StreamDetails/styles.module.scss'

export interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

const suffix = '_stream'
const actionsWidth = 50
const minColumnWidth = 190

export interface Props {
  isFooterOpen: boolean
}

const StreamDetailsWrapper = (props: Props) => {
  const {
    entries: loadedEntries = [],
    keyName: key
  } = useSelector(streamDataSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()

  const [uniqFields, setUniqFields] = useState({})
  const [entries, setEntries] = useState<IStreamEntry[]>([])
  const [columns, setColumns] = useState<ITableColumn[]>([])
  const [deleting, setDeleting] = useState<string>('')

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
    setColumns([idColumn, ...Object.keys(fields).map((field) => getTemplateColumn(field)), actionsColumn])
  }, [loadedEntries, deleting])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((entry = '') => {
    setDeleting(`${entry + suffix}`)
  }, [])

  const handleDeleteEntry = (entryId = '') => {
    dispatch(deleteStreamEntry(key, [entryId]))
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
        <EuiText size="s" style={{ maxWidth: '100%', minHeight: '36px' }}>
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

  const [idColumn, actionsColumn]: ITableColumn[] = [
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
    {
      id: 'actions',
      label: '',
      headerClassName: styles.actionsHeader,
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      render: function Actions(_act: any, { id }: StreamEntryDto) {
        return (
          <div>
            <PopoverDelete
              text={(
                <>
                  This Entry will be removed from
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
        {...props}
      />
    </>
  )
}

export default StreamDetailsWrapper
