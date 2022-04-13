/* eslint-disable react/no-this-in-sfc */
import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { formatDistanceToNow } from 'date-fns'
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
} from 'uiSrc/slices/keys'
import {
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
} from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import KeysSummary from 'uiSrc/components/keys-summary'
import { IKeyListPropTypes } from 'uiSrc/constants/prop-types/keys'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import TreeViewSVG from 'uiSrc/assets/img/icons/treeview.svg'
import TreeViewActiveSVG from 'uiSrc/assets/img/icons/treeview_active.svg'

import FilterKeyType from '../filter-key-type'
import SearchKeyList from '../search-key-list'

import styles from './styles.module.scss'

const TIMEOUT_TO_UPDATE_REFRESH_TIME = 1_000 * 60 // once a minute
const HIDE_REFRESH_LABEL_WIDTH = 700

interface IViewType {
  tooltipText: string
  type: KeyViewType
  ariaLabel: string
  dataTestId: string
  getClassName: () => string
  isActiveView: () => boolean
  getIconType: () => string
}

export interface Props {
  loading: boolean
  keysState: IKeyListPropTypes
  sizes: any
  loadKeys: (type?: KeyViewType) => void
  loadMoreItems?: (config: any) => void
  handleAddKeyPanel: (value: boolean) => void
}

const KeysHeader = (props: Props) => {
  let interval: NodeJS.Timeout
  const { loading, keysState, sizes, loadKeys, loadMoreItems, handleAddKeyPanel } = props

  const { lastRefreshTime } = useSelector(keysDataSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType, isSearched, isFiltered } = useSelector(keysSelector)

  const [lastRefreshMessage, setLastRefreshMessage] = useState('')
  const [showRefreshLabel, setShowRefreshLabel] = useState(true)
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
        return this.isActiveView() ? TreeViewActiveSVG : TreeViewSVG
      },
    },
  ]

  const scanMoreStyle = {
    marginLeft: 10,
    height: '36px !important',
  }

  useEffect(() => {
    globalThis.addEventListener('resize', updateSizes)

    return () => {
      globalThis.removeEventListener('resize', updateSizes)
    }
  }, [])

  useEffect(() => {
    updateSizes()
  }, [sizes])

  useEffect(() => {
    updateLastRefresh()

    interval = setInterval(() => {
      if (document.hidden) return

      updateLastRefresh()
    }, TIMEOUT_TO_UPDATE_REFRESH_TIME)
    return () => clearInterval(interval)
  }, [lastRefreshTime])

  const updateSizes = () => {
    const isShowRefreshLabel = (rootDivRef?.current?.offsetWidth || 0) > HIDE_REFRESH_LABEL_WIDTH
    setShowRefreshLabel(isShowRefreshLabel)
  }

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

  const ViewSwitch = (
    <div className={styles.viewTypeSwitch} data-testid="view-type-switcher">
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

  const RefreshBtn = (
    <div className={styles.refresh}>
      {showRefreshLabel && (
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
      <div className={styles.top}>
        <FilterKeyType />
        <SearchKeyList />
        {ViewSwitch}
        {AddKeyBtn}
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
        {RefreshBtn}
      </div>
    </div>
  )
}

export default KeysHeader
