import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { debounce, findIndex, isUndefined, reject } from 'lodash'

import { CellMeasurerCache } from 'react-virtualized'
import {
  bufferToString,
  bufferFormatRangeItems,
  Nullable,
  Maybe,
} from 'uiSrc/utils'
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
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeysStoreData, SearchMode } from 'uiSrc/slices/interfaces/keys'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { KeyTypes, ModulesKeyTypes, TableCellAlignment, TableCellTextAlignment } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'

import { GetKeyInfoResponse } from 'apiSrc/modules/browser/keys/dto'

import NoKeysMessage from '../no-keys-message'
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
  onDelete: (key: RedisResponseBuffer) => void
  commonFilterType: Nullable<KeyTypes>
  onAddKeyPanel: (value: boolean) => void
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
  } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const selectedKey = useSelector(selectedKeySelector)
  const { nextCursor, previousResultCount } = useSelector(keysDataSelector)
  const { isSearched, isFiltered, searchMode, deleting } = useSelector(keysSelector)
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

  const NoItemsMessage = () => (
    <NoKeysMessage
      total={keysState.total}
      scanned={keysState.scanned}
      onAddKeyPanel={onAddKeyPanel}
    />
  )

  const getNoItemsMessage = () => {
    if (isNotRendered.current) {
      return ''
    }

    if (itemsRef.current.length < keysState.keys.length) {
      return 'loading...'
    }

    return <NoItemsMessage />
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
        event: TelemetryEvent.BROWSER_KEY_DELETE_CLICKED,
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
      onDelete(key)
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

  const onRowsRenderedOverscan = (startIndex: number, lastIndex: number) => {
    const { startIndex: prevStartIndex, lastIndex: prevLastIndex } = renderedRowsIndexesRef.current
    if (prevStartIndex === startIndex && prevLastIndex === lastIndex) return

    onRowsRendered(startIndex, lastIndex)
  }
  const onRowsRenderedDebounced = debounce(onRowsRenderedOverscan, 100)

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
      render: (cellData: any, { nameString }: any) => (
        <KeyRowType type={cellData} nameString={nameString} />
      )
    },
    {
      id: 'nameString',
      label: 'Key',
      minWidth: 94,
      truncateText: true,
      render: (cellData: string) => (
        <KeyRowName nameString={cellData} />
      )
    },
    {
      id: 'ttl',
      label: 'TTL',
      absoluteWidth: 86,
      minWidth: 86,
      truncateText: true,
      alignment: TableCellAlignment.Right,
      render: (cellData: number, { nameString }: IKeyPropTypes, _expanded, rowIndex) => (
        <KeyRowTTL ttl={cellData} nameString={nameString} deletePopoverId={deletePopoverIndex} rowId={rowIndex || 0} />
      )
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
        { nameString, type, name: bufferName }: IKeyPropTypes,
        _expanded,
        rowIndex
      ) => (
        <KeyRowSize
          size={cellData}
          nameString={nameString}
          nameBuffer={bufferName}
          deletePopoverId={deletePopoverIndex}
          rowId={rowIndex || 0}
          type={type}
          deleting={deleting}
          setDeletePopoverId={setDeletePopoverIndex}
          handleDeletePopoverOpen={handleDeletePopoverOpen}
          handleDelete={handleRemoveKey}
        />
      )
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
