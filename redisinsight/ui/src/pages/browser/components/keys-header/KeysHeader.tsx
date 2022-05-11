/* eslint-disable react/no-this-in-sfc */
import React, { Ref, useEffect, useRef, useState, FC, SVGProps } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { formatDistanceToNow } from 'date-fns'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  EuiButton,
  EuiButtonIcon,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'

import {
  changeKeyViewType,
  fetchKeys,
  keysDataSelector,
  keysSelector,
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

import FilterKeyType from '../filter-key-type'
import SearchKeyList from '../search-key-list'

import styles from './styles.module.scss'

const TIMEOUT_TO_UPDATE_REFRESH_TIME = 1_000 * 60 // once a minute
const HIDE_REFRESH_LABEL_WIDTH = 700
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
  isFullScreen: boolean
  keysState: KeysStoreData
  loadKeys: (type?: KeyViewType) => void
  loadMoreItems?: (config: any) => void
  handleAddKeyPanel: (value: boolean) => void
  onExitFullScreen: () => void
}

const KeysHeader = (props: Props) => {
  let interval: NodeJS.Timeout
  const {
    loading,
    isFullScreen,
    keysState,
    loadKeys,
    loadMoreItems,
    handleAddKeyPanel,
    onExitFullScreen
  } = props

  const { lastRefreshTime } = useSelector(keysDataSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType, isSearched, isFiltered } = useSelector(keysSelector)

  const [lastRefreshMessage, setLastRefreshMessage] = useState('')
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

  useEffect(() => {
    updateLastRefresh()

    interval = setInterval(() => {
      if (document.hidden) return

      updateLastRefresh()
    }, TIMEOUT_TO_UPDATE_REFRESH_TIME)
    return () => clearInterval(interval)
  }, [lastRefreshTime])

  const handleRefreshKeys = () => {
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
    dispatch(fetchKeys(
      '0',
      viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      () => dispatch(setBrowserKeyListDataLoaded(true)),
      () => dispatch(setBrowserKeyListDataLoaded(false)),
    ))
    dispatch(resetBrowserTree())
  }

  const handleScanMore = (config: any) => {
    loadMoreItems?.({
      ...config,
      stopIndex: (viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT) - 1,
    })
  }

  const updateLastRefresh = () => {
    lastRefreshTime && setLastRefreshMessage(
      `${formatDistanceToNow(lastRefreshTime, { addSuffix: true })}`
    )
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

  const handleSwitchView = (type: KeyViewType) => {
    if (type === KeyViewType.Tree) {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_OPENED,
        eventData: {
          databaseId: instanceId
        }
      })
    }
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

  const exitFullScreenBtn = (
    <EuiToolTip
      content="Exit Full Screen"
      position="left"
      anchorClassName={styles.exitFullScreenBtn}
    >
      <EuiButtonIcon
        iconType="fullScreenExit"
        color="primary"
        aria-label="Exit full screen"
        onClick={onExitFullScreen}
        data-testid="toggle-full-screen"
      />
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

  const RefreshBtn = (width: number) => (
    <div className={styles.refresh}>
      {width > HIDE_REFRESH_LABEL_WIDTH && (
        <EuiTextColor className={styles.refreshSummary} style={{ verticalAlign: 'middle' }}>
          Last refresh:
          <span className={styles.refreshTime}>
            {` ${lastRefreshMessage}`}
          </span>
        </EuiTextColor>
      )}

      <EuiToolTip
        title="Last Refresh"
        className={styles.tooltip}
        position="top"
        content={lastRefreshMessage}
      >
        <EuiButtonIcon
          iconType="refresh"
          color="primary"
          disabled={loading}
          onClick={handleRefreshKeys}
          onMouseEnter={updateLastRefresh}
          className={styles.btnRefresh}
          aria-labelledby="Refresh keys"
          data-testid="refresh-keys-btn"
        />
      </EuiToolTip>
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
              <div>
                {AddKeyBtn}
                {isFullScreen && exitFullScreenBtn}
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
              />
              {RefreshBtn(width)}
            </div>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default KeysHeader
