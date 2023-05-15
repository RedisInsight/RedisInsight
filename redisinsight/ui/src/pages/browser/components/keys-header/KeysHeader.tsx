/* eslint-disable react/destructuring-assignment */
import { EuiButton, EuiButtonIcon, EuiIcon, EuiLink, EuiPopover, EuiText, EuiToolTip, } from '@elastic/eui'
import cx from 'classnames'
/* eslint-disable react/no-this-in-sfc */
import React, { FC, Ref, SVGProps, useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { ReactComponent as BulkActionsIcon } from 'uiSrc/assets/img/icons/bulk_actions.svg'
import { ReactComponent as TreeViewIcon } from 'uiSrc/assets/img/icons/treeview.svg'
import { ReactComponent as VectorIcon } from 'uiSrc/assets/img/icons/vector.svg'
import { ReactComponent as RediSearchIcon } from 'uiSrc/assets/img/modules/RedisSearchLight.svg'
import KeysSummary from 'uiSrc/components/keys-summary'
import { BrowserStorageItem, BulkActionsType } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { localStorageService } from 'uiSrc/services'
import { resetBrowserTree, setBrowserKeyListDataLoaded, } from 'uiSrc/slices/app/context'

import { changeKeyViewType, changeSearchMode, fetchKeys, keysSelector, resetKeysData, } from 'uiSrc/slices/browser/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeysStoreData, KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isRedisearchAvailable } from 'uiSrc/utils'

import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import {
  incrementOnboardStepAction,
  removeFeatureFromHighlighting
} from 'uiSrc/slices/app/features'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'
import AutoRefresh from '../auto-refresh'
import FilterKeyType from '../filter-key-type'
import RediSearchIndexesList from '../redisearch-key-list'
import SearchKeyList from '../search-key-list'

import styles from './styles.module.scss'

const HIDE_REFRESH_LABEL_WIDTH = 600
const FULL_SCREEN_RESOLUTION = 1260

interface ISwitchType<T> {
  tooltipText: string
  type: T
  disabled?: boolean
  ariaLabel: string
  dataTestId: string
  getClassName: () => string
  onClick: () => void
  isActiveView: () => boolean
  getIconType: () => string | FC<SVGProps<SVGSVGElement>>
}

export interface Props {
  loading: boolean
  keysState: KeysStoreData
  nextCursor: string
  isSearched: boolean
  loadKeys: (type?: KeyViewType) => void
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
  handleCreateIndexPanel: (value: boolean) => void
  handleScanMoreClick: (config: any) => void
}

const KeysHeader = (props: Props) => {
  const {
    loading,
    keysState,
    isSearched,
    loadKeys,
    handleAddKeyPanel,
    handleBulkActionsPanel,
    handleCreateIndexPanel,
    handleScanMoreClick,
    nextCursor,
  } = props

  const { id: instanceId, modules } = useSelector(connectedInstanceSelector)
  const { viewType, searchMode, isFiltered } = useSelector(keysSelector)
  const { selectedIndex } = useSelector(redisearchSelector)

  const rootDivRef: Ref<HTMLDivElement> = useRef(null)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useDispatch()

  const viewTypes: ISwitchType<KeyViewType>[] = [
    {
      type: KeyViewType.Browser,
      tooltipText: 'List View',
      ariaLabel: 'List view button',
      dataTestId: 'view-type-browser-btn',
      isActiveView() { return viewType === this.type },
      getClassName() {
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return 'menu'
      },
      onClick() { handleSwitchView(this.type) }
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
      onClick() {
        handleSwitchView(this.type)
        dispatch(incrementOnboardStepAction(
          OnboardingSteps.BrowserTreeView,
          undefined,
          () => sendEventTelemetry({
            event: TelemetryEvent.ONBOARDING_TOUR_ACTION_MADE,
            eventData: {
              databaseId: instanceId,
              step: OnboardingStepName.BrowserTreeView,
            }
          })
        ))
      }
    },
  ]

  const searchModes: ISwitchType<SearchMode>[] = [
    {
      type: SearchMode.Pattern,
      tooltipText: 'Filter by Key Name or Pattern',
      ariaLabel: 'Filter by Key Name or Pattern button',
      dataTestId: 'search-mode-pattern-btn',
      isActiveView() { return searchMode === this.type },
      getClassName() {
        return cx(styles.viewTypeBtn, styles.iconVector, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return VectorIcon
      },
      onClick() { handleSwitchSearchMode(this.type) }
    },
    {
      type: SearchMode.Redisearch,
      tooltipText: 'Search by Values of Keys',
      ariaLabel: 'Search by Values of Keys button',
      dataTestId: 'search-mode-redisearch-btn',
      disabled: !isRedisearchAvailable(modules),
      isActiveView() { return searchMode === this.type },
      getClassName() {
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return RediSearchIcon
      },
      onClick() {
        if (this.disabled) {
          showPopover()
        } else {
          handleSwitchSearchMode(this.type)
        }
      }
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
      {
        searchMode,
        cursor: '0',
        count: viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      },
      () => dispatch(setBrowserKeyListDataLoaded(searchMode, true)),
      () => dispatch(setBrowserKeyListDataLoaded(searchMode, false)),
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
    handleScanMoreClick?.({
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
    dispatch(setBulkActionType(BulkActionsType.Delete))
    handleBulkActionsPanel(true)
    dispatch(removeFeatureFromHighlighting('bulkUpload'))
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
    dispatch(resetBrowserTree())
    dispatch(resetKeysData(searchMode))
    localStorageService.set(BrowserStorageItem.browserViewType, type)

    if (!(searchMode === SearchMode.Redisearch && !selectedIndex)) {
      loadKeys(type)
    }

    setTimeout(() => {
      dispatch(changeKeyViewType(type))
    }, 0)
  }

  const handleSwitchSearchMode = (mode: SearchMode) => {
    if (searchMode !== mode) {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_MODE_CHANGED,
        eventData: {
          databaseId: instanceId,
          previous: searchMode,
          current: mode,
          view: viewType,
        }
      })
    }

    dispatch(changeSearchMode(mode))

    if (viewType === KeyViewType.Tree) {
      dispatch(resetBrowserTree())
    }

    localStorageService.set(BrowserStorageItem.browserSearchMode, mode)
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
      <OnboardingTour options={ONBOARDING_FEATURES.BROWSER_TREE_VIEW}>
        <>
          {viewTypes.map((view) => (
            <EuiToolTip content={view.tooltipText} position="top" key={view.tooltipText}>
              <EuiButtonIcon
                className={view.getClassName()}
                iconType={view.getIconType()}
                aria-label={view.ariaLabel}
                onClick={() => view.onClick()}
                data-testid={view.dataTestId}
              />
            </EuiToolTip>
          ))}
        </>
      </OnboardingTour>
    </div>
  )

  const showPopover = useCallback(() => {
    setIsPopoverOpen(true)
  }, [])

  const hidePopover = useCallback(() => {
    setIsPopoverOpen(false)
  }, [])

  const SwitchModeBtn = (item: ISwitchType<SearchMode>) => (
    <EuiButtonIcon
      className={item.getClassName()}
      iconType={item.getIconType()}
      aria-label={item.ariaLabel}
      onClick={() => item.onClick?.()}
      data-testid={item.dataTestId}
    />
  )

  const SearchModeSwitch = (width: number) => (
    <div
      className={
        cx(styles.searchModeSwitch, {
          [styles.middleScreen]: width > HIDE_REFRESH_LABEL_WIDTH,
          [styles.fullScreen]: width > FULL_SCREEN_RESOLUTION
        })
      }
      data-testid="search-mode-switcher"
    >
      {searchModes.map((mode) => (
        !mode.disabled ? (
          <EuiToolTip content={mode.tooltipText} position="bottom" key={mode.tooltipText}>
            {SwitchModeBtn(mode)}
          </EuiToolTip>
        )
          : (
            <EuiToolTip content={mode.tooltipText} position="bottom" key={mode.tooltipText}>
              <EuiPopover
                ownFocus={false}
                anchorPosition="downCenter"
                isOpen={isPopoverOpen}
                closePopover={hidePopover}
                panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popoverPanelWrapper)}
                panelPaddingSize="l"
                button={SwitchModeBtn(mode)}
              >
                <EuiText className={styles.noModuleInfo}>
                  {'RediSearch module is not loaded. Create a '}
                  <EuiLink
                    color="subdued"
                    href="https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_browser_search"
                    className={styles.link}
                    external={false}
                    target="_blank"
                    data-testid="redisearch-free-db"
                  >
                    free Redis database
                  </EuiLink>
                  {' with module support on Redis Cloud.'}
                </EuiText>
              </EuiPopover>
            </EuiToolTip>
          )))}

    </div>
  )

  return (
    <div className={styles.content} ref={rootDivRef}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <div className={styles.top}>
              <OnboardingTour
                options={ONBOARDING_FEATURES.BROWSER_FILTER_SEARCH}
                anchorPosition="downLeft"
                panelClassName={styles.browserFilterOnboard}
              >
                {SearchModeSwitch(width)}
              </OnboardingTour>
              {searchMode === SearchMode.Pattern ? (
                <FilterKeyType />
              ) : (
                <RediSearchIndexesList onCreateIndex={handleCreateIndexPanel} />
              )}
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
                scanned={
                  isSearched
                  || (isFiltered && searchMode === SearchMode.Pattern)
                  || viewType === KeyViewType.Tree ? keysState.scanned : 0
                }
                loading={loading}
                showScanMore={
                  !(searchMode === SearchMode.Redisearch
                    && keysState.maxResults
                    && keysState.keys.length >= keysState.maxResults)
                }
                scanMoreStyle={scanMoreStyle}
                loadMoreItems={handleScanMore}
                nextCursor={nextCursor}
              />
              <AutoRefresh
                postfix="keys"
                loading={loading}
                lastRefreshTime={keysState.lastRefreshTime}
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

export default React.memo(KeysHeader)
