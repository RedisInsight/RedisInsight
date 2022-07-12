import { EuiButtonIcon, EuiProgress, EuiText, EuiToolTip } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { isEqual, isNull } from 'lodash'
import { CellMeasurerCache } from 'react-virtualized'

import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  listSelector,
  listDataSelector,
  fetchListElements,
  fetchMoreListElements,
  updateListElementAction,
  updateListValueStateSelector,
  fetchSearchingListElementAction,
} from 'uiSrc/slices/browser/list'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { KeyTypes, TableCellAlignment } from 'uiSrc/constants'
import {
  ITableColumn,
  IColumnSearchState,
} from 'uiSrc/components/virtual-table/interfaces'
import { formatLongName, validateListIndex } from 'uiSrc/utils'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import { columnWidth } from 'uiSrc/components/virtual-grid'
import {
  SetListElementDto,
  SetListElementResponse,
} from 'apiSrc/modules/browser/dto'
import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 43
const footerHeight = 0
const initSearchingIndex = null

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IListElement extends SetListElementResponse {
  editing: boolean;
}

interface Props {
  isFooterOpen: boolean
}

const ListDetails = (props: Props) => {
  const { isFooterOpen } = props
  const [elements, setElements] = useState<IListElement[]>([])
  const [width, setWidth] = useState(100)

  const { loading } = useSelector(listSelector)
  const { loading: updateLoading } = useSelector(updateListValueStateSelector)
  const { elements: loadedElements, total, searchedIndex } = useSelector(
    listDataSelector
  )

  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    const listElements: IListElement[] = loadedElements.map((item, index) => ({
      index: searchedIndex ?? index,
      element: item,
      editing: false,
    }))
    setElements(listElements)
  }, [loadedElements])

  const handleEditElement = (index = 0, editing: boolean) => {
    const newElemsState = elements.map((item) => {
      if (item.index === index) {
        return { ...item, editing }
      }
      return item
    })

    if (!isEqual(elements, newElemsState)) {
      setElements(newElemsState)
    }

    cellCache.clearAll()
  }

  const handleApplyEditElement = (index = 0, element: string) => {
    const data: SetListElementDto = {
      keyName: key,
      element,
      index,
    }
    dispatch(
      updateListElementAction(data, () => handleEditElement(index, false))
    )
  }

  const handleSearch = (search: IColumnSearchState[]) => {
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
        const cellContent = index.toString().substring(0, 200)
        const tooltipContent = formatLongName(index.toString())
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
        { element, index, editing }: IListElement,
        expanded: boolean = false
      ) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = element.substring(0, 200)
        const tooltipContent = formatLongName(element)

        if (editing) {
          return (
            <StopPropagation>
              <div className={styles.inlineItemEditor}>
                <InlineItemEditor
                  initialValue={element}
                  controlsPosition="right"
                  placeholder="Enter Element"
                  fieldName="elementValue"
                  expandable
                  isLoading={updateLoading}
                  onDecline={() => handleEditElement(index, false)}
                  onApply={(value) => handleApplyEditElement(index, value)}
                />
              </div>
            </StopPropagation>
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
                  title="Element"
                  className={styles.tooltip}
                  position="bottom"
                  content={tooltipContent}
                  anchorClassName="truncateText"
                >
                  <>{cellContent}</>
                </EuiToolTip>
              )}
              {expanded && element}
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
      render: function Actions(_element: any, { index }: IListElement) {
        return (
          <StopPropagation>
            <div className="value-table-actions">
              <EuiButtonIcon
                iconType="pencil"
                aria-label="Edit element"
                className="editFieldBtn"
                color="primary"
                onClick={() => handleEditElement(index, true)}
                data-testid={`edit-list-button-${index}`}
              />
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
          width: columnWidth(i, width, arr)
        }))}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={elements}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onSearch={handleSearch}
        cellCache={cellCache}
      />
    </div>
  )
}

export default ListDetails
