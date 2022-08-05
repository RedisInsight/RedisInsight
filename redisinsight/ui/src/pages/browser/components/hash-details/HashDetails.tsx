import { EuiButtonIcon, EuiProgress, EuiText, EuiTextArea, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CellMeasurerCache } from 'react-virtualized'
import { omit, union } from 'lodash'
import { onlyText } from 'react-children-utilities'

import {
  hashSelector,
  hashDataSelector,
  deleteHashFields,
  fetchHashFields,
  fetchMoreHashFields,
  updateHashValueStateSelector,
  updateHashFieldsAction,
  setHashFields,
} from 'uiSrc/slices/browser/hash'
import { formatLongName, createDeleteFieldHeader, createDeleteFieldMessage, Nullable, bufferFormatRangeItems, formattingBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent, getMatchType } from 'uiSrc/telemetry'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import {
  IColumnSearchState,
  ITableColumn,
} from 'uiSrc/components/virtual-table/interfaces'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector, keysSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import HelpTexts from 'uiSrc/constants/help-texts'
import { KeyTypes, OVER_RENDER_BUFFER_COUNT, TableCellAlignment } from 'uiSrc/constants'
import { getColumnWidth } from 'uiSrc/components/virtual-grid'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import { stringToBuffer } from 'uiSrc/utils/formatters/bufferFormatters'
import {
  GetHashFieldsResponse,
  AddFieldsToHashDto,
  HashFieldDto,
} from 'apiSrc/modules/browser/dto/hash.dto'

import PopoverDelete from '../popover-delete/PopoverDelete'
import styles from './styles.module.scss'

const suffix = '_hash'
const matchAllValue = '*'
const headerHeight = 60
const rowHeight = 43
const APPROXIMATE_WIDTH_OF_SIGN = 8.3

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IHashField extends HashFieldDto {
  editing: boolean;
}

export interface Props {
  isFooterOpen: boolean
}

const HashDetails = (props: Props) => {
  const { isFooterOpen } = props

  const {
    total,
    nextCursor,
    fields: loadedFields,
  } = useSelector(hashDataSelector)
  const { loading } = useSelector(hashSelector)
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)
  const { name: key, length } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { loading: updateLoading } = useSelector(updateHashValueStateSelector)

  const [match, setMatch] = useState<Nullable<string>>(matchAllValue)
  const [deleting, setDeleting] = useState('')
  const [fields, setFields] = useState<IHashField[]>([])
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [areaValue, setAreaValue] = useState<string>('')
  const [, forceUpdate] = useState({})

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    const hashFields = bufferFormatRangeItems(loadedFields, 0, OVER_RENDER_BUFFER_COUNT, formatItem)

    setFields(hashFields)

    if (loadedFields.length < fields.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)

      cellCache.clearAll()
      setTimeout(() => {
        cellCache.clearAll()
      }, 0)
    }
  }, [loadedFields, viewFormatProp])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((field = '') => {
    setDeleting(`${field + suffix}`)
  }, [])

  const onSuccessRemoved = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Hash,
        numberOfRemoved: 1,
      }
    })
  }

  const handleDeleteField = (field = '') => {
    dispatch(deleteHashFields(key, [stringToBuffer(field)], onSuccessRemoved))
    closePopover()
  }

  const handleEditField = useCallback((field = '', editing: boolean) => {
    setFields((prevFields) => prevFields.map((item, i) => {
      if (item.field?.viewValue === field) {
        setAreaValue(onlyText(item.value?.viewValue))
        return { ...item, editing }
      }
      return item
    }))

    setTimeout(() => {
      cellCache.clearAll()
      forceUpdate({})
    }, 0)
  }, [cellCache])

  const handleApplyEditField = (field = '') => {
    const data: AddFieldsToHashDto = {
      keyName: key,
      fields: [{ field, value: stringToBuffer(areaValue) }],
    }
    dispatch(updateHashFieldsAction(data, () => onHashEditedSuccess(field)))
  }

  const onHashEditedSuccess = (fieldName = '') => {
    const indexOfField = fields.findIndex(({ field }) => field === fieldName)
    setExpandedRows((prevState) => union(prevState, [indexOfField]))

    handleEditField(fieldName, false)
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
        keyType: KeyTypes.Hash
      }
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'field')
    if (fieldColumn) {
      const { value: match } = fieldColumn
      const onSuccess = (data: GetHashFieldsResponse) => {
        const matchValue = getMatchType(match)
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED
          ),
          eventData: {
            databaseId: instanceId,
            keyType: KeyTypes.Hash,
            match: matchValue,
            length: data.total,
          }
        })
      }
      setMatch(match)
      dispatch(fetchHashFields(key, 0, SCAN_COUNT_DEFAULT, match || matchAllValue, true, onSuccess))
    }
  }

  const handleRowToggleViewClick = (expanded: boolean, rowIndex: number) => {
    const browserViewEvent = expanded
      ? TelemetryEvent.BROWSER_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.BROWSER_KEY_FIELD_VALUE_COLLAPSED
    const treeViewEvent = expanded
      ? TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED

    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        keyType: KeyTypes.Hash,
        databaseId: instanceId,
        largestCellLength: Math.max(...Object.values(fields[rowIndex]).map((a) => a.toString().length)) || 0,
      }
    })

    cellCache.clearAll()
  }

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      dispatch(setHashFields(bufferFormatRows(fields.length - 1)))
      dispatch(
        fetchMoreHashFields(
          key,
          nextCursor,
          SCAN_COUNT_DEFAULT,
          match || matchAllValue
        )
      )
    }
  }

  const formatItem = useCallback(({ field, value }: HashFieldDto): IHashField => ({
    field: {
      ...field,
      viewValue: formattingBuffer(field, viewFormatProp),
    },
    value: {
      ...value,
      viewValue: formattingBuffer(value, viewFormatProp),
    },
    editing: false
  }), [viewFormatProp])

  const bufferFormatRows = (lastIndex: number) => {
    const newFields = bufferFormatRangeItems(fields, formattedLastIndexRef.current, lastIndex, formatItem)

    setFields(newFields)

    if (lastIndex > formattedLastIndexRef.current) {
      formattedLastIndexRef.current = lastIndex
    }

    return newFields
  }

  const columns: ITableColumn[] = [
    {
      id: 'field',
      label: 'Field',
      isSearchable: true,
      prependSearchName: 'Field:',
      initialSearchValue: '',
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Field(_name: string, { field: fieldItem }: HashFieldDto, expanded?: boolean) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const field = fieldItem.viewValue ?? ''
        const cellContent = field.substring?.(0, 200) ?? field
        const tooltipContent = formatLongName(onlyText(field))

        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}>
            <div style={{ display: 'flex' }} data-testid={`hash-field-${field}`}>
              {!expanded && (
                <EuiToolTip
                  title="Field"
                  className={styles.tooltip}
                  anchorClassName="truncateText"
                  position="bottom"
                  content={tooltipContent}
                >
                  <>{cellContent}</>
                </EuiToolTip>
              )}
              {expanded && field}
            </div>
          </EuiText>
        )
      },
    },
    {
      id: 'value',
      label: 'Value',
      truncateText: true,
      alignment: TableCellAlignment.Left,
      render: function Value(
        _name: string,
        { field: fieldItem, value: valueItem, editing }: IHashField,
        expanded?: boolean,
      ) {
        const field = fieldItem.viewValue ?? ''
        const value = valueItem.viewValue ?? ''
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = value.substring?.(0, 200) ?? value
        const tooltipContent = formatLongName(onlyText(value))

        if (editing) {
          const text = areaValue
          const calculatedBreaks = text?.split('\n').length
          const textAreaWidth = textAreaRef.current?.clientWidth ?? 0
          const OneRowLength = textAreaWidth / APPROXIMATE_WIDTH_OF_SIGN
          const calculatedRows = Math.round(text?.length / OneRowLength + calculatedBreaks)
          return (
            <StopPropagation>
              <InlineItemEditor
                expandable
                initialValue={onlyText(value)}
                controlsPosition="inside"
                controlsDesign="separate"
                placeholder="Enter Value"
                fieldName="fieldValue"
                isLoading={updateLoading}
                controlsClassName={styles.textAreaControls}
                onDecline={() => handleEditField(field, false)}
                onApply={() => handleApplyEditField(omit(fieldItem, ['viewValue']))}
              >
                <EuiTextArea
                  fullWidth
                  name="value"
                  id="value"
                  rows={calculatedRows}
                  resize="none"
                  placeholder="Enter Value"
                  value={areaValue}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    cellCache.clearAll()
                    setAreaValue(e.target.value)
                  }}
                  disabled={updateLoading}
                  inputRef={textAreaRef}
                  className={styles.textArea}
                  data-testid="hash-value-editor"
                />
              </InlineItemEditor>
            </StopPropagation>
          )
        }
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}>
            <div
              style={{ display: 'flex' }}
              data-testid={`hash-field-value-${field}`}
            >
              {!expanded && (
                <EuiToolTip
                  title="Value"
                  className={styles.tooltip}
                  position="bottom"
                  content={tooltipContent}
                  anchorClassName="truncateText"
                >
                  <>{cellContent}</>
                </EuiToolTip>
              )}
              {expanded && value}
            </div>
          </EuiText>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'value-table-header-actions',
      className: 'actions',
      absoluteWidth: 95,
      minWidth: 95,
      maxWidth: 95,
      render: function Actions(_act: any, { field: fieldItem }: HashFieldDto) {
        const field = fieldItem.viewValue
        return (
          <StopPropagation>
            <div className="value-table-actions">
              <EuiButtonIcon
                iconType="pencil"
                aria-label="Edit field"
                className="editFieldBtn"
                color="primary"
                disabled={updateLoading}
                onClick={() => handleEditField(field, true)}
                data-testid={`edit-hash-button-${field}`}
              />
              <PopoverDelete
                header={createDeleteFieldHeader(fieldItem)}
                text={createDeleteFieldMessage(key ?? '')}
                item={field}
                suffix={suffix}
                deleting={deleting}
                closePopover={closePopover}
                updateLoading={updateLoading}
                showPopover={showPopover}
                testid={`remove-hash-button-${field}`}
                handleDeleteItem={handleDeleteField}
                handleButtonClick={handleRemoveIconClick}
                appendInfo={length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT('Field') : null}
              />
            </div>
          </StopPropagation>
        )
      },
    },
  ]

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'hash-fields-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
      >
        {loading && (
          <EuiProgress
            color="primary"
            size="xs"
            position="absolute"
            data-testid="progress-key-hash"
          />
        )}
        <VirtualTable
          hideProgress
          expandable
          keyName={key}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          onChangeWidth={setWidth}
          columns={columns.map((column, i, arr) => ({
            ...column,
            width: getColumnWidth(i, width, arr)
          }))}
          footerHeight={0}
          overscanRowCount={10}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={fields}
          totalItemsCount={total}
          noItemsMessage={NoResultsFoundText}
          onWheel={closePopover}
          onSearch={handleSearch}
          cellCache={cellCache}
          onRowToggleViewClick={handleRowToggleViewClick}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          onRowsRendered={({ overscanStopIndex }) => bufferFormatRows(overscanStopIndex)}
        />
      </div>
    </>
  )
}

export default HashDetails
