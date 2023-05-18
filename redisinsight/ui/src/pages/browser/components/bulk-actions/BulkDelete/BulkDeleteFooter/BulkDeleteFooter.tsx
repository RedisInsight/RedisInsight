import React, { useState } from 'react'
import { EuiButton, EuiIcon, EuiPopover, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  bulkActionsDeleteOverviewSelector,
  setBulkDeleteStartAgain,
  toggleBulkDeleteActionTriggered,
  bulkActionsDeleteSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { keysDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { getMatchType, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BulkActionsType } from 'uiSrc/constants'
import { getRangeForNumber, BULK_THRESHOLD_BREAKPOINTS } from 'uiSrc/utils'

import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import BulkDeleteContent from '../BulkDeleteContent'
import { isProcessedBulkAction } from '../../utils'

import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const BulkDeleteFooter = (props: Props) => {
  const { onCancel } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { filter, search } = useSelector(keysSelector)
  const { scanned, total } = useSelector(keysDataSelector)
  const { loading } = useSelector(bulkActionsDeleteSelector)
  const { status } = useSelector(bulkActionsDeleteOverviewSelector) ?? { }

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleDelete = () => {
    setIsPopoverOpen(false)
    dispatch(toggleBulkDeleteActionTriggered())
  }

  const handleDeleteWarning = () => {
    setIsPopoverOpen(true)

    let matchValue = DEFAULT_SEARCH_MATCH
    if (search !== DEFAULT_SEARCH_MATCH && !!search) {
      matchValue = getMatchType(search)
    }

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_WARNING,
      eventData: {
        filter: {
          match: matchValue,
          type: filter,
        },
        progress: {
          scanned,
          scannedRange: getRangeForNumber(scanned, BULK_THRESHOLD_BREAKPOINTS),
          total,
          totalRange: getRangeForNumber(total, BULK_THRESHOLD_BREAKPOINTS),
        },
        databaseId: instanceId,
        action: BulkActionsType.Delete
      }
    })
  }

  const handleStartNew = () => {
    dispatch(setBulkDeleteStartAgain())
  }

  const handleStop = () => {
    dispatch(toggleBulkDeleteActionTriggered())
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className={styles.container} data-testid="bulk-actions-delete">
      {status && <BulkDeleteContent />}
      <div className={styles.footer}>
        {!loading && (
          <EuiButton
            color="secondary"
            onClick={handleCancel}
            className={styles.cancelBtn}
            data-testid="bulk-action-cancel-btn"
          >
            {isProcessedBulkAction(status) ? 'Close' : 'Cancel'}
          </EuiButton>
        )}
        {loading && (
          <EuiButton
            color="secondary"
            onClick={handleStop}
            className={styles.cancelBtn}
            data-testid="bulk-action-stop-btn"
          >
            Stop
          </EuiButton>
        )}

        {!isProcessedBulkAction(status) && (
          <EuiPopover
            id="bulk-delete-warning-popover"
            anchorPosition="upCenter"
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}
            panelClassName={styles.panelPopover}
            panelPaddingSize="none"
            button={(
              <EuiButton
                fill
                color="secondary"
                isLoading={loading}
                disabled={loading}
                onClick={handleDeleteWarning}
                data-testid="bulk-action-warning-btn"
              >
                Delete
              </EuiButton>
            )}
          >
            <EuiText color="subdued" className={styles.containerPopover} data-testid="bulk-action-tooltip">
              <EuiIcon
                type="alert"
                className={styles.popoverIcon}
              />
              <div className={cx(styles.popoverItem, styles.popoverItemTitle)}>
                Are you sure you want to perform this action?
              </div>
              <div className={styles.popoverItem}>
                {`All keys with ${filter ? filter?.toUpperCase() : 'all'} key type and selected pattern will be deleted.`}
              </div>
              <EuiButton
                fill
                size="s"
                color="warning"
                className={styles.deleteApproveBtn}
                onClick={handleDelete}
                data-testid="bulk-action-apply-btn"
              >
                Delete
              </EuiButton>
            </EuiText>
          </EuiPopover>
        )}
        {isProcessedBulkAction(status) && (
          <EuiButton
            fill
            iconType="refresh"
            color="secondary"
            onClick={handleStartNew}
            data-testid="bulk-action-start-again-btn"
          >
            Start New
          </EuiButton>
        )}
      </div>
    </div>
  )
}

export default BulkDeleteFooter
