/* eslint-disable react/no-this-in-sfc */
import React, { Ref, useRef, FC, SVGProps } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  EuiButton,
  EuiButtonIcon,
  EuiIcon,
  EuiToolTip,
} from '@elastic/eui'

import {
  changeKeyViewType,
  fetchKeys,
  keysDataSelector,
  keysSelector,
  resetKeys,
  resetKeysData,
} from 'uiSrc/slices/browser/keys'
import {
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
} from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeysStoreData, KeyViewType } from 'uiSrc/slices/interfaces/keys'
import KeysSummary from 'uiSrc/components/keys-summary'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { ReactComponent as TreeViewIcon } from 'uiSrc/assets/img/icons/treeview.svg'
import { ReactComponent as BulkActionsIcon } from 'uiSrc/assets/img/icons/bulk_actions.svg'

import FilterKeyType from '../filter-key-type'
import SearchKeyList from '../search-key-list'
import AutoRefresh from '../auto-refresh'

import styles from './styles.module.scss'

const HIDE_REFRESH_LABEL_WIDTH = 600
const FULL_SCREEN_RESOLUTION = 1260

interface IViewType {
  tooltipText: string
  type: KeyViewType
  ariaLabel: string
  dataTestId: string
  getClassName: () => string
  isActiveView: () => boolean
  getIconType: () => string | FC<SVGProps<SVGSVGElement>>
}

export interface Props {
  loading: boolean
  keysState: KeysStoreData
  nextCursor: string
  loadKeys: (type?: KeyViewType) => void
  loadMoreItems?: (config: any) => void
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}

const KeysHeader = (props: Props) => {
  const {
    loading,
    keysState,
    loadKeys,
    loadMoreItems,
    handleAddKeyPanel,
    handleBulkActionsPanel,
    nextCursor,
  } = props

  const { lastRefreshTime } = useSelector(keysDataSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType, isSearched, isFiltered } = useSelector(keysSelector)

  const rootDivRef: Ref<HTMLDivElement> = useRef(null)

  const dispatch = useDispatch()

  const viewTypes: IViewType[] = [
    {
      type: KeyViewType.Browser,
      tooltipText: 'Browser',
      ariaLabel: 'Browser view button',
      dataTestId: 'view-type-browser-btn',
      isActiveView() { return viewType === this.type },
      getClassName() {
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return 'menu'
      },
    },
    {
      type: KeyViewType.Tree,
      tooltipText: 'Tree View',
      ariaLabel: 'Tree view button',
      dataTestId: 'view-type-list-btn',
      isActiveView() { return viewType === this.type },
      getClassName() {
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return TreeViewIcon
      },
    },
  ]

  const scanMoreStyle = {
    marginLeft: 10,
    height: '36px !important',
  }

  const handleRefreshKeys = (enableAutoRefresh: boolean) => {
    if (!enableAutoRefresh) {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_LIST_REFRESH_CLICKED,
          TelemetryEvent.TREE_VIEW_KEY_LIST_REFRESH_CLICKED
        ),
        eventData: {
          databaseId: instanceId
        }
      })
    }
    dispatch(fetchKeys(
      '0',
      viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      () => dispatch(setBrowserKeyListDataLoaded(true)),
      () => dispatch(setBrowserKeyListDataLoaded(false)),
    ))
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    const browserViewEvent = enableAutoRefresh
      ? TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_ENABLED
      : TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_DISABLED
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        databaseId: instanceId,
        refreshRate: +refreshRate,
      }
    })
  }

  const handleChangeAutoRefreshRate = (enableAutoRefresh: boolean, refreshRate: string) => {
    if (enableAutoRefresh) {
      handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
    }
  }

  const handleScanMore = (config: any) => {
    loadMoreItems?.({
      ...config,
      stopIndex: (viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT) - 1,
    })
  }

  const openAddKeyPanel = () => {
    handleAddKeyPanel(true)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_BUTTON_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED
      ),
      eventData: {
        databaseId: instanceId
      }
    })
  }

  const openBulkActions = () => {
    handleBulkActionsPanel(true)
  }

  const handleSwitchView = (type: KeyViewType) => {
    if (type === KeyViewType.Tree) {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_OPENED,
        eventData: {
          databaseId: instanceId
        }
      })
    }
    dispatch(resetKeysData())
    dispatch(changeKeyViewType(type))
    dispatch(resetBrowserTree())
    localStorageService.set(BrowserStorageItem.browserViewType, type)
    loadKeys(type)
  }

  const AddKeyBtn = (
    <EuiButton
      fill
      size="s"
      color="secondary"
      onClick={openAddKeyPanel}
      className={styles.addKey}
      data-testid="btn-add-key"
    >
      + Key
    </EuiButton>
  )

  const BulkActionsBtn = (
    <EuiToolTip content="Bulk Actions" position="top">
      <EuiButton
        fill
        size="s"
        color="secondary"
        onClick={openBulkActions}
        className={styles.bulkActions}
        data-testid="btn-bulk-actions"
      >
        <EuiIcon type={BulkActionsIcon} />
      </EuiButton>
    </EuiToolTip>
  )

  const ViewSwitch = (width: number) => (
    <div
      className={
        cx(styles.viewTypeSwitch, {
          [styles.middleScreen]: width > HIDE_REFRESH_LABEL_WIDTH,
          [styles.fullScreen]: width > FULL_SCREEN_RESOLUTION
        })
      }
      data-testid="view-type-switcher"
    >
      {viewTypes.map((view) => (
        <EuiToolTip content={view.tooltipText} position="top" key={view.tooltipText}>
          <EuiButtonIcon
            className={view.getClassName()}
            iconType={view.getIconType()}
            aria-label={view.ariaLabel}
            onClick={() => handleSwitchView(view.type)}
            data-testid={view.dataTestId}
          />
        </EuiToolTip>
      ))}

    </div>
  )

  return (
    <div className={styles.content} ref={rootDivRef}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <div className={styles.top}>
              <FilterKeyType />
              <SearchKeyList />
              {ViewSwitch(width)}
              <div style={{ minWidth: '120px' }}>
                {AddKeyBtn}
                {BulkActionsBtn}
              </div>
            </div>

            <div className={styles.bottom}>
              <KeysSummary
                items={keysState.keys}
                totalItemsCount={keysState.total}
                scanned={isSearched || isFiltered || viewType === KeyViewType.Tree ? keysState.scanned : 0}
                loading={loading}
                scanMoreStyle={scanMoreStyle}
                loadMoreItems={handleScanMore}
                nextCursor={nextCursor}
              />
              <AutoRefresh
                postfix="keys"
                loading={loading}
                lastRefreshTime={lastRefreshTime}
                displayText={width > HIDE_REFRESH_LABEL_WIDTH}
                containerClassName={styles.refreshContainer}
                onRefresh={handleRefreshKeys}
                onEnableAutoRefresh={handleEnableAutoRefresh}
                onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                testid="refresh-keys-btn"
              />
            </div>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default KeysHeader
