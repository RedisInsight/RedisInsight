import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { debounce, findIndex, isUndefined, reject } from 'lodash'

import {
  EuiText,
  EuiToolTip,
  EuiTextColor,
  EuiLoadingContent,
  EuiPopover,
  EuiButton,
  EuiButtonIcon, EuiSpacer,
} from '@elastic/eui'
import { CellMeasurerCache } from 'react-virtualized'
import {
  formatBytes,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
  replaceSpaces,
  formatLongName,
  bufferToString,
  bufferFormatRangeItems,
  Nullable,
  Maybe,
} from 'uiSrc/utils'
import {
  NoResultsFoundText,
  FullScanNoResultsFoundText,
  ScanNoResultsFoundText,
  NoSelectedIndexText,
} from 'uiSrc/constants/texts'
import {
  deleteKeyAction,
  fetchKeysMetadata,
  keysDataSelector,
  keysSelector,
  selectedKeySelector,
  sourceKeysFetch,
} from 'uiSrc/slices/browser/keys'
import {
  appContextBrowser,
  setBrowserPatternScrollPosition,
  setBrowserIsNotRendered,
  setBrowserRedisearchScrollPosition,
} from 'uiSrc/slices/app/context'
import { GroupBadge } from 'uiSrc/components'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeysStoreData, SearchMode } from 'uiSrc/slices/interfaces/keys'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { KeyTypes, ModulesKeyTypes, TableCellAlignment, TableCellTextAlignment } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import NoKeysFound from 'uiSrc/pages/browser/components/no-keys-found'

import { GetKeyInfoResponse } from 'apiSrc/modules/browser/dto'

import styles from './styles.module.scss'

export interface Props {
  keysState: KeysStoreData
  loading: boolean
  scrollTopPosition?: number
  hideFooter?: boolean
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems?: (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number, stopIndex: number },
  ) => void
  onDelete: () => void
  commonFilterType: Nullable<KeyTypes>
  onAddKeyPanel: (value: boolean) => void
  onBulkActionsPanel: (value: boolean) => void
}

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 43,
})

const KeyList = forwardRef((props: Props, ref) => {
  let wheelTimer = 0
  const {
    selectKey,
    loadMoreItems,
    loading,
    keysState,
    scrollTopPosition,
    hideFooter,
    onDelete,
    commonFilterType,
    onAddKeyPanel,
    onBulkActionsPanel,
  } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const selectedKey = useSelector(selectedKeySelector)
  const { total, nextCursor, previousResultCount } = useSelector(keysDataSelector)
  const { isSearched, isFiltered, viewType, searchMode, deleting } = useSelector(keysSelector)
  const { selectedIndex } = useSelector(redisearchSelector)
  const { keyList: { isNotRendered: isNotRenderedContext } } = useSelector(appContextBrowser)

  const [, rerender] = useState({})
  const [firstDataLoaded, setFirstDataLoaded] = useState<boolean>(!!keysState.keys.length)
  const [deletePopoverIndex, setDeletePopoverIndex] = useState<Maybe<number>>(undefined)

  const controller = useRef<Nullable<AbortController>>(null)
  const itemsRef = useRef(keysState.keys)
  const isNotRendered = useRef(isNotRenderedContext)
  const renderedRowsIndexesRef = useRef({ startIndex: 0, lastIndex: 0 })

  const dispatch = useDispatch()

  useImperativeHandle(ref, () => ({
    handleLoadMoreItems(config: { startIndex: number; stopIndex: number }) {
      onLoadMoreItems(config)
    }
  }))

  useEffect(() => {
    cancelAllMetadataRequests()
  }, [searchMode])

  useEffect(() => {
    itemsRef.current = [...keysState.keys]

    if (!isNotRendered.current && !loading) {
      setFirstDataLoaded(true)
    }

    isNotRendered.current = false
    dispatch(setBrowserIsNotRendered(isNotRendered.current))
    if (itemsRef.current.length === 0) {
      cancelAllMetadataRequests()
      setFirstDataLoaded(true)
      rerender({})
      return
    }

    cancelAllMetadataRequests()
    controller.current = new AbortController()

    const { startIndex, lastIndex } = renderedRowsIndexesRef.current
    onRowsRendered(startIndex, lastIndex)
    rerender({})
  }, [keysState.keys])

  const cancelAllMetadataRequests = () => {
    controller.current?.abort()
  }

  const getNoItemsMessage = () => {
    if (isNotRendered.current) {
      return ''
    }

    if (searchMode === SearchMode.Redisearch) {
      if (!selectedIndex) {
        return NoSelectedIndexText
      }

      if (total === 0) {
        return NoResultsFoundText
      }

      if (isSearched) {
        return keysState.scanned < total ? NoResultsFoundText : FullScanNoResultsFoundText
      }
    }

    if (total === 0) {
      return (<NoKeysFound onAddKeyPanel={onAddKeyPanel} onBulkActionsPanel={onBulkActionsPanel} />)
    }

    if (isSearched) {
      return keysState.scanned < total ? ScanNoResultsFoundText : FullScanNoResultsFoundText
    }

    if (isFiltered && keysState.scanned < total) {
      return ScanNoResultsFoundText
    }

    if (itemsRef.current.length < keysState.keys.length) {
      return 'loading...'
    }

    return NoResultsFoundText
  }

  const onLoadMoreItems = (props: { startIndex: number, stopIndex: number }) => {
    if (searchMode === SearchMode.Redisearch
      && keysState.maxResults
      && keysState.keys.length >= keysState.maxResults
    ) {
      return
    }
    loadMoreItems?.(itemsRef.current as IKeyPropTypes[], props)
  }

  const onWheelSearched = (event: React.WheelEvent) => {
    setDeletePopoverIndex(undefined)
    if (
      !loading
      && (isSearched || isFiltered)
      && event.deltaY > 0
      && !sourceKeysFetch
      && nextCursor !== '0'
      && previousResultCount === 0
    ) {
      clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        onLoadMoreItems({ stopIndex: SCAN_COUNT_DEFAULT, startIndex: 1 })
      }, 100)
    }
  }

  const handleDeletePopoverOpen = (index: Maybe<number>, type: KeyTypes | ModulesKeyTypes) => {
    if (index !== deletePopoverIndex) {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_DELETE_CLICKED,
          TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED
        ),
        eventData: {
          databaseId: instanceId,
          keyType: type,
          source: 'keyList'
        }
      })
    }
    setDeletePopoverIndex(index !== deletePopoverIndex ? index : undefined)
  }

  const handleRemoveKey = (key: RedisResponseBuffer) => {
    dispatch(deleteKeyAction(key, () => {
      setDeletePopoverIndex(undefined)
      onDelete()
    }))
  }

  const setScrollTopPosition = useCallback((position: number) => {
    if (searchMode === SearchMode.Pattern) {
      dispatch(setBrowserPatternScrollPosition(position))
    } else {
      dispatch(setBrowserRedisearchScrollPosition(position))
    }
  }, [searchMode])

  const formatItem = useCallback((item: GetKeyInfoResponse) => ({
    ...item,
    nameString: bufferToString(item.name as string)
  }), [])

  const onRowsRendered = (startIndex: number, lastIndex: number) => {
    renderedRowsIndexesRef.current = { lastIndex, startIndex }

    const newItems = bufferFormatRows(startIndex, lastIndex)

    getMetadata(startIndex, newItems)
    rerender({})
  }

  const onRowsRenderedDebounced = debounce(onRowsRendered, 100)

  const bufferFormatRows = (startIndex: number, lastIndex: number): IKeyPropTypes[] => {
    const newItems = bufferFormatRangeItems(
      itemsRef.current, startIndex, lastIndex, formatItem
    )
    itemsRef.current.splice(startIndex, newItems.length, ...newItems)

    return newItems
  }

  const getMetadata = useCallback((
    startIndex: number,
    itemsInit: IKeyPropTypes[] = []
  ): void => {
    const isSomeNotUndefined = ({ type, size, length }: IKeyPropTypes) =>
      (!commonFilterType && !isUndefined(type)) || !isUndefined(size) || !isUndefined(length)

    const firstEmptyItemIndex = findIndex(itemsInit, (item) => !isSomeNotUndefined(item))
    if (firstEmptyItemIndex === -1) return

    const emptyItems = reject(itemsInit, isSomeNotUndefined)

    dispatch(fetchKeysMetadata(
      emptyItems.map(({ name }) => name),
      commonFilterType,
      controller.current?.signal,
      (loadedItems) =>
        onSuccessFetchedMetadata(startIndex + firstEmptyItemIndex, loadedItems),
      () => { rerender({}) }
    ))
  }, [commonFilterType])

  const onSuccessFetchedMetadata = (
    startIndex: number,
    loadedItems: GetKeyInfoResponse[],
  ) => {
    const items = loadedItems.map(formatItem)
    itemsRef.current.splice(startIndex, items.length, ...items)

    rerender({})
  }

  const columns: ITableColumn[] = [
    {
      id: 'type',
      label: 'Type',
      absoluteWidth: 'auto',
      minWidth: 126,
      render: (cellData: any, { nameString: name }: any) => (
        isUndefined(cellData)
          ? <EuiLoadingContent lines={1} className={styles.keyInfoLoading} data-testid="type-loading" />
          : <GroupBadge type={cellData} name={name} />
      )
    },
    {
      id: 'nameString',
      label: 'Key',
      minWidth: 94,
      truncateText: true,
      render: (cellData: string) => {
        if (isUndefined(cellData)) {
          return (
            <EuiLoadingContent
              lines={1}
              className={cx(styles.keyInfoLoading, styles.keyNameLoading)}
              data-testid="name-loading"
            />
          )
        }
        // Better to cut the long string, because it could affect virtual scroll performance
        const name = cellData || ''
        const cellContent = replaceSpaces(name?.substring(0, 200))
        const tooltipContent = formatLongName(name)
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex' }} className="truncateText" data-testid={`key-${name}`}>
              <EuiToolTip
                title="Key Name"
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
      }
    },
    {
      id: 'ttl',
      label: 'TTL',
      absoluteWidth: 86,
      minWidth: 86,
      truncateText: true,
      alignment: TableCellAlignment.Right,
      render: (cellData: number, { nameString: name }: IKeyPropTypes, _expanded, rowIndex) => {
        if (isUndefined(cellData)) {
          return <EuiLoadingContent lines={1} className={styles.keyInfoLoading} data-testid="ttl-loading" />
        }
        if (cellData === -1) {
          return (
            <EuiTextColor
              className={cx('moveOnHover', { hide: deletePopoverIndex === rowIndex })}
              color="subdued"
              data-testid={`ttl-${name}`}
            >
              No limit
            </EuiTextColor>
          )
        }
        return (
          <EuiText
            className={cx('moveOnHover', { hide: deletePopoverIndex === rowIndex })}
            color="subdued"
            size="s"
            style={{ maxWidth: '100%' }}
          >
            <div style={{ display: 'flex' }} className="truncateText" data-testid={`ttl-${name}`}>
              <EuiToolTip
                title="Time to Live"
                className={styles.tooltip}
                anchorClassName="truncateText"
                position="right"
                content={(
                  <>
                    {`${truncateTTLToSeconds(cellData)} s`}
                    <br />
                    {`(${truncateNumberToDuration(cellData)})`}
                  </>
                )}
              >
                <>{truncateNumberToFirstUnit(cellData)}</>
              </EuiToolTip>
            </div>
          </EuiText>
        )
      },
    },
    {
      id: 'size',
      label: 'Size',
      absoluteWidth: 90,
      minWidth: 90,
      alignment: TableCellAlignment.Right,
      textAlignment: TableCellTextAlignment.Right,
      render: (
        cellData: number,
        { nameString: name, type, name: bufferName }: IKeyPropTypes,
        _expanded,
        rowIndex
      ) => {
        if (isUndefined(cellData)) {
          return <EuiLoadingContent lines={1} className={styles.keyInfoLoading} data-testid="size-loading" />
        }

        if (!cellData) {
          return (
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }} data-testid={`size-${name}`}>
              -
            </EuiText>
          )
        }
        return (
          <>
            <EuiText
              color="subdued"
              size="s"
              className={cx('moveOnHover', { hide: deletePopoverIndex === rowIndex })}
              style={{ maxWidth: '100%' }}
            >
              <div style={{ display: 'flex' }} className="truncateText" data-testid={`size-${name}`}>
                <EuiToolTip
                  title="Key Size"
                  className={styles.tooltip}
                  anchorClassName="truncateText"
                  position="right"
                  content={(
                    <>
                      {formatBytes(cellData, 3)}
                    </>
                  )}
                >
                  <>{formatBytes(cellData, 0)}</>
                </EuiToolTip>
              </div>
            </EuiText>
            <EuiPopover
              anchorClassName={cx(styles.deleteAnchor, 'showOnHover', { show: deletePopoverIndex === rowIndex })}
              anchorPosition="rightUp"
              isOpen={deletePopoverIndex === rowIndex}
              closePopover={() => setDeletePopoverIndex(undefined)}
              panelPaddingSize="l"
              panelClassName={styles.deletePopover}
              button={(
                <EuiButtonIcon
                  iconType="trash"
                  onClick={() => handleDeletePopoverOpen(rowIndex, type)}
                  aria-label="Delete Key"
                  data-testid={`delete-key-btn-${name}`}
                />
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <>
                <EuiText size="m">
                  <h4 style={{ wordBreak: 'break-all' }}><b>{formatLongName(name)}</b></h4>
                  <EuiText size="s">will be deleted.</EuiText>
                </EuiText>
                <EuiSpacer size="m" />
                <EuiButton
                  fill
                  size="s"
                  color="warning"
                  iconType="trash"
                  isDisabled={deleting}
                  onClick={() => handleRemoveKey(bufferName)}
                  data-testid="submit-delete-key"
                >
                  Delete
                </EuiButton>
              </>
            </EuiPopover>
          </>
        )
      }
    },
  ]

  const VirtualizeTable = () => (
    <VirtualTable
      selectable
      onRowClick={selectKey}
      headerHeight={0}
      rowHeight={43}
      threshold={50}
      columns={columns}
      cellCache={cellCache}
      loadMoreItems={onLoadMoreItems}
      onWheel={onWheelSearched}
      loading={loading || !firstDataLoaded}
      items={itemsRef.current}
      totalItemsCount={keysState.total ?? Infinity}
      scanned={isSearched || isFiltered ? keysState.scanned : 0}
      noItemsMessage={getNoItemsMessage()}
      selectedKey={selectedKey.data}
      scrollTopProp={scrollTopPosition}
      setScrollTopPosition={setScrollTopPosition}
      hideFooter={hideFooter}
      onRowsRendered={({ overscanStartIndex, overscanStopIndex }) =>
        onRowsRenderedDebounced(overscanStartIndex, overscanStopIndex)}
    />
  )

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={cx(styles.table, { [styles.table__withoutFooter]: hideFooter })}>
          <div className="key-list-table" data-testid="keyList-table">
            {searchMode === SearchMode.Pattern && VirtualizeTable()}
            {searchMode !== SearchMode.Pattern && VirtualizeTable()}
          </div>
        </div>
      </div>
    </div>
  )
})

export default React.memo(KeyList)
