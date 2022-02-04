import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButton,
  EuiIcon,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiToolTip,
  EuiTextColor,
} from '@elastic/eui'
import { formatDistanceToNow } from 'date-fns'
import {
  formatBytes,
  formatLongName,
  replaceSpaces,
  truncateTTLToDuration,
  truncateTTLToFirstUnit,
  truncateTTLToSeconds,
} from 'uiSrc/utils'
import {
  NoKeysToDisplayText,
  NoResultsFoundText,
  FullScanNoResultsFoundText,
  ScanNoResultsFoundText,
} from 'uiSrc/constants/texts'
import {
  fetchKeys,
  keysDataSelector,
  keysSelector,
  selectedKeySelector,
  sourceKeysFetch,
} from 'uiSrc/slices/keys'
import {
  appContextBrowser,
  setBrowserKeyListDataLoaded,
  setBrowserKeyListScrollPosition
} from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { GroupBadge } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { IKeyListPropTypes, IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { TableCellAlignment, TableCellTextAlignment } from 'uiSrc/constants'

import VirtualTree from 'uiSrc/components/virtual-tree'
import { constructKeysToTree } from 'uiSrc/helpers'
import FilterKeyType from '../filter-key-type'
import SearchKeyList from '../search-key-list'

import styles from './styles.module.scss'
import KeyList from '../key-list/KeyList'

export interface Props {
  keysState: IKeyListPropTypes;
  loading: boolean;
  selectKey: ({ rowData }: { rowData: any }) => void;
  loadMoreItems: ({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }) => void;
  handleAddKeyPanel: (value: boolean) => void;
}

const KeyTree = (props: Props) => {
  let wheelTimer = 0
  const { selectKey, loadMoreItems, loading, keysState, handleAddKeyPanel } = props

  const [lastRefreshMessage, setLastRefreshMessage] = useState('')
  const [constructingTree, setConstructingTree] = useState(true)

  const { data: selectedKey } = useSelector(selectedKeySelector)
  const { total, nextCursor, previousResultCount, lastRefreshTime } = useSelector(keysDataSelector)
  const { isSearched, isFiltered } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { keyList: { scrollTopPosition } } = useSelector(appContextBrowser)

  const [keyListState, setKeyListState] = useState<IKeyListPropTypes>(keysState)

  const dispatch = useDispatch()

  const handleRefreshKeys = () => {
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_KEY_LIST_REFRESH_CLICKED,
      eventData: {
        databaseId: instanceId
      }
    })
    setConstructingTree(true)

    dispatch(fetchKeys(
      '0',
      SCAN_COUNT_DEFAULT,
      () => dispatch(setBrowserKeyListDataLoaded(true)),
      () => dispatch(setBrowserKeyListDataLoaded(false)),
    ))
  }

  const openAddKeyPanel = () => {
    handleAddKeyPanel(true)
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_KEY_ADD_BUTTON_CLICKED,
      eventData: {
        databaseId: instanceId
      }
    })
  }

  const getNoItemsMessage = () => {
    if (isSearched) {
      return keysState.scanned < total ? ScanNoResultsFoundText : FullScanNoResultsFoundText
    }
    if (isFiltered && keysState.scanned < total) {
      return ScanNoResultsFoundText
    }
    return total ? NoResultsFoundText : NoKeysToDisplayText
  }

  const updateKeysList = (items:any) => {
    const newState:IKeyListPropTypes = {
      ...keyListState,
      keys: Object.values(items)
    }
    setKeyListState(newState)
  }

  const updateLastRefresh = () => {
    setLastRefreshMessage(
      lastRefreshTime
        ? `${formatDistanceToNow(lastRefreshTime, { addSuffix: true })}`
        : 'Refresh'
    )
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
        loadMoreItems({ stopIndex: SCAN_COUNT_DEFAULT, startIndex: 1 })
      }, 100)
    }
  }

  const setScrollTopPosition = (position: number) => {
    dispatch(setBrowserKeyListScrollPosition(position))
  }

  const keyHeaderLabel = (
    <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false} wrap>
      <EuiFlexItem grow={false}>
        <EuiText size="m">Key</EuiText>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiButton
          style={{ marginLeft: '12px' }}
          fill
          size="s"
          color="secondary"
          onClick={openAddKeyPanel}
          data-testid="btn-add-key"
        >
          + Key
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  )

  const columns: ITableColumn[] = [
    {
      id: 'type',
      label: 'Type',
      absoluteWidth: 107,
      minWidth: 107,
      render: (cellData: any, { name }: any) => <GroupBadge type={cellData} name={name} />,
    },
    {
      id: 'name',
      label: keyHeaderLabel,
      minWidth: 160,
      truncateText: true,
      render: (cellData: string = '', { name }: any) => {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = replaceSpaces(cellData.substring(0, 200))
        const tooltipContent = formatLongName(cellData)
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex' }} className="truncateText'" data-testid={`key-${name}`}>
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
      },
    },
    {
      id: 'ttl',
      label: 'TTL',
      absoluteWidth: 65,
      minWidth: 65,
      truncateText: true,
      alignment: TableCellAlignment.Right,
      render: (cellData: number, { name }: any) => {
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
                <>{truncateTTLToFirstUnit(cellData)}</>
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
      render: (cellData: number, { name }: any) => {
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
    {
      id: 'actions',
      label: '',
      alignment: TableCellAlignment.Center,
      absoluteWidth: 50,
      minWidth: 50,
      render: () => (
        <span className={styles.action}>
          <EuiIcon style={{ cursor: 'pointer' }} type="arrowRight" />
        </span>
      ),
    },
  ]

  const loadMoreRows = async (params: IndexRange): Promise<any> => {
    const { startIndex, stopIndex } = params

    // We do not load more results for first load
    // if (forceScrollTop !== undefined) return

    if (!loading) {
      loadMoreItems({ startIndex, stopIndex })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <FilterKeyType />
          <SearchKeyList />
          <div>
            <EuiButton
              fill
              size="s"
              color="secondary"
              style={{ marginLeft: 25, height: 26 }}
              disabled={loading || constructingTree}
              onClick={() => {
                setConstructingTree(true)

                loadMoreRows({
                  stopIndex: SCAN_COUNT_DEFAULT - 1,
                  startIndex: 0,
                })
              }}
              data-testid="scan-more"
            >
              Scan more
            </EuiButton>
          </div>
          <div className={styles.refresh}>
            <EuiToolTip
              title="Last Refresh"
              className={styles.tooltip}
              position="top"
              content={lastRefreshMessage}
            >
              <EuiButtonIcon
                iconType="refresh"
                color="primary"
                disabled={loading || constructingTree}
                onClick={handleRefreshKeys}
                onMouseEnter={updateLastRefresh}
                className={styles.btnRefresh}
                aria-labelledby="Refresh keys"
                data-testid="refresh-keys-btn"
              />
            </EuiToolTip>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.tree}>
            {/* <div className="key-list-table" data-testid="keys-tree"> */}
            <VirtualTree
              items={keysState.keys}
              webworkerFn={constructKeysToTree}
              onSelectLeaf={updateKeysList}
              // webworkerFn={constructKeysToTreeSingle}
              setConstructingTree={setConstructingTree}
            />
          </div>
          <div className={styles.list}>
            <KeyList
              withoutHeader
              keysState={keyListState}
              loading={loading}
              selectKey={selectKey}
              handleAddKeyPanel={handleAddKeyPanel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyTree
