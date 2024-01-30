/* eslint-disable react/no-this-in-sfc */
/* eslint-disable react/destructuring-assignment */
import React, { FC, SVGProps, useCallback, useState } from 'react'

import cx from 'classnames'
import { EuiButton, EuiButtonIcon, EuiModal, EuiModalBody, EuiToolTip } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { OnboardingTour, ModuleNotLoaded } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import FilterKeyType from 'uiSrc/pages/browser/components/filter-key-type'
import RediSearchIndexesList from 'uiSrc/pages/browser/components/redisearch-key-list'
import SearchKeyList from 'uiSrc/pages/browser/components/search-key-list'

import { ReactComponent as BulkActionsIcon } from 'uiSrc/assets/img/icons/bulk_actions.svg'
import { ReactComponent as VectorIcon } from 'uiSrc/assets/img/icons/vector.svg'
import { ReactComponent as RediSearchIcon } from 'uiSrc/assets/img/modules/RedisSearchLight.svg'

import { changeSearchMode, keysSelector } from 'uiSrc/slices/browser/keys'
import { isRedisearchAvailable } from 'uiSrc/utils'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem, BulkActionsType } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'

import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

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
  handleCreateIndexPanel: (value: boolean) => void
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}

const BrowserSearchPanel = (props: Props) => {
  const { handleCreateIndexPanel, handleAddKeyPanel, handleBulkActionsPanel } = props
  const { viewType, searchMode } = useSelector(keysSelector)
  const { id: instanceId, modules } = useSelector(connectedInstanceSelector)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useDispatch()

  const searchModes: ISwitchType<SearchMode>[] = [
    {
      type: SearchMode.Pattern,
      tooltipText: 'Filter by Key Name or Pattern',
      ariaLabel: 'Filter by Key Name or Pattern button',
      dataTestId: 'search-mode-pattern-btn',
      isActiveView() { return searchMode === this.type },
      getClassName() {
        return cx(styles.viewTypeBtn, styles.iconVector, { [styles.active]: this.isActiveView?.() })
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
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView?.() })
      },
      getIconType() {
        return RediSearchIcon
      },
      onClick() {
        if (this.disabled) {
          showPopover()
          sendEventTelemetry({
            event: TelemetryEvent.SEARCH_MODE_CHANGE_FAILED,
            eventData: {
              databaseId: instanceId,
              view: viewType,
            }
          })
        } else {
          handleSwitchSearchMode(this.type)
        }
      }
    },
  ]

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

  const hidePopover = useCallback(() => {
    setIsPopoverOpen(false)
  }, [])

  const showPopover = useCallback(() => {
    setIsPopoverOpen(true)
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

  const AddKeyBtn = (
    <EuiButton
      fill
      size="s"
      color="secondary"
      onClick={openAddKeyPanel}
      className={styles.addKey}
      data-testid="btn-add-key"
    >
      + <span className={styles.addKeyText}>Key</span>
    </EuiButton>
  )

  const BulkActionsBtn = (
    <EuiButton
      size="s"
      color="secondary"
      iconType={BulkActionsIcon}
      onClick={openBulkActions}
      className={styles.bulkActions}
      data-testid="btn-bulk-actions"
      aria-label="bulk actions"
    >
      <span className={styles.bulkActionsText}>Bulk Actions</span>
    </EuiButton>
  )

  const SearchModeSwitch = () => (
    <div
      className={
        cx(styles.searchModeSwitch)
      }
      data-testid="search-mode-switcher"
    >
      {searchModes.map((mode) => (
        <EuiToolTip content={mode.tooltipText} position="bottom" key={mode.tooltipText}>
          {SwitchModeBtn(mode)}
        </EuiToolTip>
      ))}
    </div>
  )

  return (
    <div className={styles.content}>
      {isPopoverOpen && (
        <EuiModal onClose={hidePopover} className={styles.moduleNotLoaded}>
          <EuiModalBody className={styles.modalBody}>
            <ModuleNotLoaded
              moduleName={RedisDefaultModules.Search}
              type="browser"
              id="0"
              onClose={hidePopover}
            />
          </EuiModalBody>
        </EuiModal>
      )}
      <div className={styles.searchWrapper}>
        <OnboardingTour
          options={ONBOARDING_FEATURES.BROWSER_FILTER_SEARCH}
          anchorPosition="downLeft"
          panelClassName={styles.browserFilterOnboard}
        >
          {SearchModeSwitch()}
        </OnboardingTour>
        {searchMode === SearchMode.Pattern ? (
          <FilterKeyType />
        ) : (
          <RediSearchIndexesList onCreateIndex={handleCreateIndexPanel} />
        )}
        <SearchKeyList />
      </div>
      <div style={{ flexShrink: 0 }}>
        {BulkActionsBtn}
        {AddKeyBtn}
      </div>
    </div>
  )
}

export default BrowserSearchPanel
