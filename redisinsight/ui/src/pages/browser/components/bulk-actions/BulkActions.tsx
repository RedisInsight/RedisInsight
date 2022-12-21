import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
  EuiText,
} from '@elastic/eui'
import { useParams } from 'react-router-dom'
import { isUndefined } from 'lodash'

import {
  setBulkActionType,
  selectedBulkActionsSelector,
  overviewBulkActionsSelector,
  bulkActionsSelector,
  setBulkActionsInitialState,
} from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType } from 'uiSrc/constants'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { getMatchType, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import BulkDelete from './BulkDelete'
import BulkActionsTabs from './BulkActionsTabs'
import BulkActionsInfo from './BulkActionsInfo'
import BulkDeleteSummary from './BulkDelete/BulkDeleteSummary'
import styles from './styles.module.scss'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onBulkActionsPanel: (value: boolean) => void
  onClosePanel: () => void
  onToggleFullScreen: () => void
}
const BulkActions = (props: Props) => {
  const { isFullScreen, arePanelsCollapsed, onClosePanel, onBulkActionsPanel, onToggleFullScreen } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { filter, search, isSearched, isFiltered } = useSelector(keysSelector)
  const { type } = useSelector(selectedBulkActionsSelector)
  const { loading } = useSelector(bulkActionsSelector)
  const { status, filter: { match, type: filterType } = {} } = useSelector(overviewBulkActionsSelector) ?? {}

  const [title, setTitle] = useState<string>('Bulk Actions')
  const [typeSelected, setTypeSelected] = useState<BulkActionsType>(type)
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(!isSearched && !isFiltered)

  const dispatch = useDispatch()
  useEffect(() => {
    let matchValue = '*'
    if (search !== '*' && !!search) {
      matchValue = getMatchType(search)
    }
    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData: {
        databaseId: instanceId,
        filterType: filter,
        match: matchValue,
      }
    })
  }, [])

  useEffect(() => {
    if (type === BulkActionsType.Delete) {
      setTitle('Bulk Actions: Delete Keys')
    }
  }, [type])

  useEffect(() => {
    setShowPlaceholder(!status && !isSearched && !isFiltered)
  }, [status, isSearched, isFiltered])

  const handleChangeType = (value: BulkActionsType) => {
    setTypeSelected(value)
    dispatch(setBulkActionType(value))
  }

  const closePanel = () => {
    onBulkActionsPanel(false)
    dispatch(setBulkActionsInitialState())

    onClosePanel()

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_CANCELLED,
      eventData: {
        databaseId: instanceId,
        filterType: filter,
        search,
        action: type
      }
    })
  }

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        justifyContent="center"
        direction="column"
        className={cx(styles.container, 'relative')}
        gutterSize="none"
      >
        <EuiFlexItem grow style={{ marginBottom: '16px' }}>
          <EuiTitle size="xs" className={styles.title}>
            <h4>{title}</h4>
          </EuiTitle>
          {!arePanelsCollapsed && (
            <EuiToolTip
              content={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              position="left"
              anchorClassName={cx(styles.anchorTooltip, styles.anchorTooltipFullScreen)}
            >
              <EuiButtonIcon
                iconType={isFullScreen ? 'fullScreenExit' : 'fullScreen'}
                color="primary"
                aria-label="Full screen btn"
                onClick={onToggleFullScreen}
                data-testid="toggle-full-screen"
              />
            </EuiToolTip>
          )}
          <EuiToolTip
            content="Close"
            position="left"
            anchorClassName={styles.anchorTooltip}
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              aria-label="Close panel"
              className={styles.closeBtn}
              data-testid="bulk-close-panel"
              onClick={closePanel}
            />
          </EuiToolTip>
        </EuiFlexItem>
        <div className="eui-yScroll">
          <div className={styles.contentActions} data-testid="bulk-actions-content">
            <BulkActionsTabs onChangeType={handleChangeType} />
            {!showPlaceholder && (
              <>
                <BulkActionsInfo
                  search={match || search || '*'}
                  loading={loading}
                  filter={isUndefined(filterType) ? filter : filterType}
                  status={status}
                >
                  <>
                    {type === BulkActionsType.Delete && (
                      <BulkDeleteSummary />
                    )}
                  </>
                </BulkActionsInfo>

                {typeSelected === BulkActionsType.Delete && (
                  <BulkDelete onCancel={closePanel} />
                )}
              </>
            )}
            {showPlaceholder && (
              <div className={styles.placeholder} data-testid="bulk-actions-placeholder">
                <EuiText color="subdued" className={styles.placeholderTitle}>No pattern or key type set</EuiText>
                <EuiText color="subdued" className={styles.placeholderSummary}>
                  To perform a bulk action, set the pattern or select the key type
                </EuiText>
              </div>
            )}
          </div>
        </div>
      </EuiFlexGroup>
    </div>
  )
}

export default BulkActions
