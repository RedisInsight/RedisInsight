import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import {
  EuiText,
  EuiToolTip,
  EuiTextColor,
} from '@elastic/eui'
import {
  formatBytes,
  truncateTTLToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
  replaceSpaces,
  formatLongName,
  bufferToString,
  bufferFormatRangeItems,
} from 'uiSrc/utils'
import {
  NoKeysToDisplayText,
  NoResultsFoundText,
  FullScanNoResultsFoundText,
  ScanNoResultsFoundText,
} from 'uiSrc/constants/texts'
import {
  keysDataSelector,
  keysSelector,
  selectedKeySelector,
  setKeys,
  sourceKeysFetch,
} from 'uiSrc/slices/browser/keys'
import {
  appContextBrowser,
  setBrowserKeyListScrollPosition
} from 'uiSrc/slices/app/context'
import { GroupBadge } from 'uiSrc/components'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { OVER_RENDER_BUFFER_COUNT, TableCellAlignment, TableCellTextAlignment } from 'uiSrc/constants'

import { GetKeyInfoResponse } from 'apiSrc/modules/browser/dto'
import styles from './styles.module.scss'

export interface Props {
  hideHeader?: boolean
  keysState: KeysStoreData
  loading: boolean
  hideFooter?: boolean
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems?: ({ startIndex, stopIndex }: { startIndex: number, stopIndex: number }) => void
}

const KeyList = (props: Props) => {
  let wheelTimer = 0
  const { selectKey, loadMoreItems, loading, keysState, hideFooter } = props

  const { data: selectedKey } = useSelector(selectedKeySelector)
  const { total, nextCursor, previousResultCount } = useSelector(keysDataSelector)
  const { isSearched, isFiltered } = useSelector(keysSelector)
  const { keyList: { scrollTopPosition } } = useSelector(appContextBrowser)

  const [items, setItems] = useState(keysState.keys)

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)

  const dispatch = useDispatch()

  useEffect(() => {
    if (keysState.keys.length > 0) {
      const newKeys = bufferFormatRangeItems(keysState.keys, 0, OVER_RENDER_BUFFER_COUNT, formatItem)

      setItems(newKeys)
    }
  }, [keysState.keys])

  const getNoItemsMessage = () => {
    if (isSearched) {
      return keysState.scanned < total ? ScanNoResultsFoundText : FullScanNoResultsFoundText
    }
    if (isFiltered && keysState.scanned < total) {
      return ScanNoResultsFoundText
    }
    return total ? NoResultsFoundText : NoKeysToDisplayText
  }

  const onLoadMoreItems = (props: { startIndex: number, stopIndex: number }) => {
    dispatch(setKeys(bufferFormatRows(items.length - 1)))
    loadMoreItems?.(props)
  }

  const onWheelSearched = (event: React.WheelEvent) => {
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

  const setScrollTopPosition = (position: number) => {
    dispatch(setBrowserKeyListScrollPosition(position))
  }

  const formatItem = (item: GetKeyInfoResponse): GetKeyInfoResponse => ({
    ...item,
    nameString: bufferToString(item.name)
  })

  const bufferFormatRows = (lastIndex: number) => {
    const newItems = bufferFormatRangeItems(items, formattedLastIndexRef.current, lastIndex, formatItem)

    setItems(newItems)

    if (lastIndex > formattedLastIndexRef.current) {
      formattedLastIndexRef.current = lastIndex
    }

    return newItems
  }

  const columns: ITableColumn[] = [
    {
      id: 'type',
      label: 'Type',
      absoluteWidth: 'auto',
      minWidth: 124,
      render: (cellData: any, { nameString: name }: any) => <GroupBadge type={cellData} name={name} />,
    },
    {
      id: 'nameString',
      label: 'Key',
      minWidth: 100,
      truncateText: true,
      render: (cellData: string = '') => {
        // Better to cut the long string, because it could affect virtual scroll performance
        const name = cellData
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
      absoluteWidth: 70,
      minWidth: 70,
      truncateText: true,
      alignment: TableCellAlignment.Right,
      render: (cellData: number, { nameString: name }: GetKeyInfoResponse) => {
        if (cellData === -1) {
          return (
            <EuiTextColor color="subdued" data-testid={`ttl-${name}`}>
              No limit
            </EuiTextColor>
          )
        }
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
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
                    {`(${truncateTTLToDuration(cellData)})`}
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
      absoluteWidth: 100,
      minWidth: 100,
      alignment: TableCellAlignment.Right,
      textAlignment: TableCellTextAlignment.Right,
      render: (cellData: number, { nameString: name }: GetKeyInfoResponse) => {
        if (!cellData) {
          return (
            <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }} data-testid={`size-${name}`}>
              -
            </EuiText>
          )
        }
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
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
        )
      }
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={cx(styles.table, { [styles.table__withoutFooter]: hideFooter })}>
          <div className="key-list-table" data-testid="keyList-table">
            <VirtualTable
              selectable
              onRowClick={selectKey}
              headerHeight={0}
              rowHeight={43}
              threshold={50}
              columns={columns}
              loadMoreItems={onLoadMoreItems}
              onWheel={onWheelSearched}
              loading={loading}
              items={items}
              totalItemsCount={keysState.total}
              scanned={isSearched || isFiltered ? keysState.scanned : 0}
              noItemsMessage={getNoItemsMessage()}
              selectedKey={selectedKey}
              scrollTopProp={scrollTopPosition}
              setScrollTopPosition={setScrollTopPosition}
              hideFooter={hideFooter}
              onRowsRendered={({ overscanStopIndex }) => bufferFormatRows(overscanStopIndex)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyList
