import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui'
import { useParams } from 'react-router-dom'

import {
  setBulkActionType,
  selectedBulkActionsSelector,
  setBulkActionsInitialState,
} from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType } from 'uiSrc/constants'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { getMatchType, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import BulkUpload from './BulkUpload'
import BulkDelete from './BulkDelete'
import BulkActionsTabs from './BulkActionsTabs'
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

  const { filter, search } = useSelector(keysSelector)
  const { type } = useSelector(selectedBulkActionsSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData: {
        databaseId: instanceId,
        filter: {
          filter,
          match: (search && search !== DEFAULT_SEARCH_MATCH) ? getMatchType(search) : DEFAULT_SEARCH_MATCH,
        },
        action: type
      }
    })
  }, [])

  const handleChangeType = (value: BulkActionsType) => {
    dispatch(setBulkActionType(value))
  }

  const closePanel = () => {
    onBulkActionsPanel(false)
    dispatch(setBulkActionsInitialState())

    onClosePanel()

    const eventData: Record<string, any> = {
      databaseId: instanceId,
      action: type
    }

    if (type === BulkActionsType.Delete) {
      eventData.filter = {
        match: (search && search !== DEFAULT_SEARCH_MATCH) ? getMatchType(search) : DEFAULT_SEARCH_MATCH,
        type: filter,
      }
    }

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_CANCELLED,
      eventData
    })
  }

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        justifyContent="center"
        direction="column"
        className={cx(styles.container, 'relative')}
        gutterSize="none"
        responsive={false}
      >
        <EuiFlexItem grow style={{ marginBottom: '16px' }}>
          <EuiTitle size="xs" className={styles.title}>
            <h4>Bulk Actions</h4>
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
          {(!arePanelsCollapsed || isFullScreen) && (
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
          )}

        </EuiFlexItem>
        <div className="eui-yScroll">
          <div className={styles.contentActions} data-testid="bulk-actions-content">
            <BulkActionsTabs onChangeType={handleChangeType} />
            {type === BulkActionsType.Upload && (<BulkUpload onCancel={closePanel} />)}
            {type === BulkActionsType.Delete && (<BulkDelete onCancel={closePanel} />)}
          </div>
        </div>
      </EuiFlexGroup>
    </div>
  )
}

export default BulkActions
