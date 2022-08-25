import { EuiButtonIcon, EuiProgress, EuiText, EuiTextArea, EuiToolTip } from '@elastic/eui'
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { isNull } from 'lodash'
import { CellMeasurerCache } from 'react-virtualized'
import AutoSizer from 'react-virtualized-auto-sizer'

import {
  listSelector,
  listDataSelector,
  fetchListElements,
  fetchMoreListElements,
  updateListElementAction,
  updateListValueStateSelector,
  fetchSearchingListElementAction,
} from 'uiSrc/slices/browser/list'
import {
  ITableColumn,
  IColumnSearchState,
} from 'uiSrc/components/virtual-table/interfaces'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { KeyTypes, OVER_RENDER_BUFFER_COUNT, TableCellAlignment, TEXT_UNPRINTABLE_CHARACTERS } from 'uiSrc/constants'
import {
  bufferToSerializedFormat,
  bufferToString,
  formatLongName,
  formattingBuffer,
  isFormatEditable,
  isNonUnicodeFormatter,
  isEqualBuffers,
  stringToBuffer,
  stringToSerializedBufferFormat,
  validateListIndex,
  Nullable
} from 'uiSrc/utils'
import { selectedKeyDataSelector, keysSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import { getColumnWidth } from 'uiSrc/components/virtual-grid'
import {
  SetListElementDto,
  SetListElementResponse,
} from 'apiSrc/modules/browser/dto'
import { calculateTextareaLines } from 'uiSrc/utils/calculateTextareaLines'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 43
const footerHeight = 0
const initSearchingIndex = null

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IListElement extends SetListElementResponse {}

interface Props {
  isFooterOpen: boolean
}

const ListDetails = (props: Props) => {
  const { isFooterOpen } = props
  const { loading } = useSelector(listSelector)
  const { loading: updateLoading } = useSelector(updateListValueStateSelector)
  const { elements: loadedElements, total, searchedIndex } = useSelector(
    listDataSelector
  )
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const [elements, setElements] = useState<IListElement[]>([])
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [editingIndex, setEditingIndex] = useState<Nullable<number>>(null)
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [areaValue, setAreaValue] = useState<string>('')
  const [, forceUpdate] = useState({})

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const textAreaRef: React.Ref<HTMLTextAreaElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    setElements(loadedElements)

    if (loadedElements.length < elements.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)
      setEditingIndex(null)

      clearCache()
    }
  }, [loadedElements, viewFormatProp])

  const clearCache = () => setTimeout(() => {
    cellCache.clearAll()
    forceUpdate({})
  }, 0)

  const handleEditElement = useCallback((
    index: Nullable<number> = null,
    editing: boolean,
    valueItem?: RedisResponseBuffer
  ) => {
    setEditingIndex(editing ? index : null)

    if (editing) {
      const value = bufferToSerializedFormat(viewFormat, valueItem, 4)
      setAreaValue(value)

      setTimeout(() => {
        textAreaRef?.current?.focus()
      }, 0)
    }

    // hack to update scrollbar padding
    clearCache()
    setTimeout(() => {
      clearCache()
    }, 0)
  }, [cellCache, viewFormat])

  const handleApplyEditElement = (index = 0) => {
    const data: SetListElementDto = {
      keyName: key,
      element: stringToSerializedBufferFormat(viewFormat, areaValue),
      index,
    }
    dispatch(
      updateListElementAction(data, () => onElementEditedSuccess(index))
    )
  }

  const onElementEditedSuccess = (elementIndex = 0) => {
    handleEditElement(elementIndex, false)
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    formattedLastIndexRef.current = 0
    const indexColumn = search.find((column) => column.id === 'index')
    const onSuccess = () => {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED
        ),
        eventData: {
          databaseId: instanceId,
          keyType: KeyTypes.List,
          match: 'EXACT_VALUE_NAME',
        }
      })
    }

    if (!indexColumn?.value) {
      dispatch(fetchListElements(key, 0, SCAN_COUNT_DEFAULT))
      return
    }

    if (indexColumn) {
      const { value } = indexColumn
      dispatch(
        fetchSearchingListElementAction(
          key,
          value ? +value : initSearchingIndex,
          onSuccess
        )
      )
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
        keyType: KeyTypes.List,
        databaseId: instanceId,
        largestCellLength: elements[rowIndex]?.element?.length || 0,
      }
    })

    cellCache.clearAll()
  }

  const columns: ITableColumn[] = [
    {
      id: 'index',
      label: 'Index',
      minWidth: 220,
      maxWidth: 220,
      absoluteWidth: 220,
      truncateText: true,
      isSearchable: true,
      prependSearchName: 'Index:',
      initialSearchValue: '',
      searchValidation: validateListIndex,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Index(_name: string, { index }: IListElement) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = index?.toString().substring(0, 200)
        const tooltipContent = formatLongName(index?.toString())
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex' }} className="truncateText" data-testid={`list-index-value-${index}`}>
              <EuiToolTip
                title="Index"
                className={styles.tooltip}
                anchorClassName="truncateText"
                position="bottom"
                content={tooltipContent}
              >
                <>{cellContent}</>
              </EuiToolTip>
            </div>
          </EuiText>
        )
      },
    },
    {
      id: 'element',
      label: 'Element',
      truncateText: true,
      alignment: TableCellAlignment.Left,
      render: function Element(
        _element: string,
        { element: elementItem, index }: IListElement,
        expanded: boolean = false,
        rowIndex = 0
      ) {
        const element = bufferToString(elementItem)
        const tooltipContent = formatLongName(element)
        const { value, isValid } = formattingBuffer(elementItem, viewFormatProp, { expanded })

        if (index === editingIndex) {
          const disabled = !isEqualBuffers(elementItem, stringToBuffer(element)) && !isNonUnicodeFormatter(viewFormat)

          setTimeout(() => cellCache.clear(rowIndex, 1), 0)

          return (
            <AutoSizer disableHeight>
              {({ width }) => (
                <div style={{ width }}>
                  <StopPropagation>
                    <div style={{ width }} className={styles.inlineItemEditor}>
                      <InlineItemEditor
                        expandable
                        preventOutsideClick
                        disableFocusTrap
                        declineOnUnmount={false}
                        initialValue={element}
                        controlsPosition="inside"
                        controlsDesign="separate"
                        placeholder="Enter Element"
                        fieldName="elementValue"
                        controlsClassName={styles.textAreaControls}
                        isLoading={updateLoading}
                        isDisabled={disabled}
                        disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
                        onDecline={() => handleEditElement(index, false)}
                        onApply={() => handleApplyEditElement(index)}
                      >
                        <EuiTextArea
                          fullWidth
                          name="value"
                          id="value"
                          rows={calculateTextareaLines(areaValue, width + 80)}
                          resize="none"
                          placeholder="Enter Element"
                          value={areaValue}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                            cellCache.clearAll()
                            setAreaValue(e.target.value)
                          }}
                          disabled={updateLoading}
                          inputRef={textAreaRef}
                          className={styles.textArea}
                          spellCheck={false}
                          data-testid="element-value-editor"
                        />
                      </InlineItemEditor>
                    </div>
                  </StopPropagation>
                </div>
              )}
            </AutoSizer>
          )
        }
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}>
            <div
              style={{ display: 'flex' }}
              data-testid={`list-element-value-${index}`}
            >
              {!expanded && (
                <EuiToolTip
                  title={isValid ? 'Element' : `Failed to convert to ${viewFormatProp}`}
                  className={styles.tooltip}
                  position="bottom"
                  content={tooltipContent}
                  anchorClassName="truncateText"
                >
                  <>{value.substring?.(0, 200) ?? value}</>
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
      minWidth: 60,
      maxWidth: 60,
      absoluteWidth: 60,
      render: function Actions(_element: any, { index, element }: IListElement) {
        const isEditable = isFormatEditable(viewFormat)
        return (
          <StopPropagation>
            <div className="value-table-actions">
              <EuiToolTip content={!isEditable ? 'Cannot change data in this format' : null}>
                <EuiButtonIcon
                  iconType="pencil"
                  aria-label="Edit element"
                  className="editFieldBtn"
                  color="primary"
                  onClick={() => handleEditElement(index, true, element)}
                  data-testid={`edit-list-button-${index}`}
                />
              </EuiToolTip>
            </div>
          </StopPropagation>
        )
      },
    },
  ]

  const loadMoreItems = ({ startIndex, stopIndex }: any) => {
    if (isNull(searchedIndex)) {
      dispatch(
        fetchMoreListElements(key, startIndex, stopIndex - startIndex + 1)
      )
    }
  }

  return (
    <div
      className={cx(
        'key-details-table',
        'list-elements-container',
        styles.container,
        {
          'footerOpened footerOpened--short': isFooterOpen,
        },
      )}
    >
      {loading && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-key-list"
        />
      )}
      <VirtualTable
        hideProgress
        expandable
        selectable={false}
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={footerHeight}
        onChangeWidth={setWidth}
        columns={columns.map((column, i, arr) => ({
          ...column,
          width: getColumnWidth(i, width, arr)
        }))}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={elements}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onSearch={handleSearch}
        cellCache={cellCache}
        onRowToggleViewClick={handleRowToggleViewClick}
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
      />
    </div>
  )
}

export default ListDetails
