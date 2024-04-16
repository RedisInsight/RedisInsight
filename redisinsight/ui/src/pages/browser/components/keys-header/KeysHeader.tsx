/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-this-in-sfc */
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { FC, Ref, SVGProps, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { ReactComponent as TreeViewIcon } from 'uiSrc/assets/img/icons/treeview.svg'
import KeysSummary from 'uiSrc/components/keys-summary'
import { BrowserStorageItem } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { localStorageService } from 'uiSrc/services'
import { resetBrowserTree, setBrowserKeyListDataLoaded, } from 'uiSrc/slices/app/context'

import { changeKeyViewType, fetchKeys, keysSelector, resetKeysData, } from 'uiSrc/slices/browser/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeysStoreData, KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { incrementOnboardStepAction } from 'uiSrc/slices/app/features'
import { AutoRefresh, OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import styles from './styles.module.scss'

const HIDE_REFRESH_LABEL_WIDTH = 640

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
  handleScanMoreClick: (config: any) => void
}

const KeysHeader = (props: Props) => {
  const {
    loading,
    keysState,
    isSearched,
    loadKeys,
    handleScanMoreClick,
    nextCursor,
  } = props

  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType, searchMode, isFiltered } = useSelector(keysSelector)
  const { selectedIndex } = useSelector(redisearchSelector)

  const rootDivRef: Ref<HTMLDivElement> = useRef(null)

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

  const scanMoreStyle = {
    marginLeft: 10,
    height: '36px !important',
  }

  const handleRefreshKeys = () => {
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

  const handleSwitchView = (type: KeyViewType) => {
    sendEventTelemetry({
      event: type === KeyViewType.Tree ? TelemetryEvent.TREE_VIEW_OPENED : TelemetryEvent.LIST_VIEW_OPENED,
      eventData: {
        databaseId: instanceId
      }
    })

    dispatch(resetBrowserTree())
    dispatch(resetKeysData(searchMode))

    if (!(searchMode === SearchMode.Redisearch && !selectedIndex)) {
      loadKeys(type)
    }

    setTimeout(() => {
      dispatch(changeKeyViewType(type))
    }, 0)
  }

  const ViewSwitch = () => (
    <div
      className={styles.viewTypeSwitch}
      data-testid="view-type-switcher"
    >
      <OnboardingTour options={ONBOARDING_FEATURES.BROWSER_TREE_VIEW}>
        <>
          {viewTypes.map((view) => (
            <EuiToolTip content={view.tooltipText} position="top" key={view.tooltipText}>
              <EuiButtonIcon
                iconSize="s"
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

  return (
    <div className={styles.content} ref={rootDivRef}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <div className={styles.bottom}>
              <div className={styles.keysSummary}>
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
              </div>
              <div className={styles.keysControlsWrapper}>
                <AutoRefresh
                  iconSize="xs"
                  postfix="keys"
                  loading={loading}
                  lastRefreshTime={keysState.lastRefreshTime}
                  displayText={(width || 0) > HIDE_REFRESH_LABEL_WIDTH}
                  containerClassName={styles.refreshContainer}
                  onRefresh={handleRefreshKeys}
                  onEnableAutoRefresh={handleEnableAutoRefresh}
                  onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                  testid="keys"
                />
                {ViewSwitch()}
              </div>
            </div>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default React.memo(KeysHeader)
