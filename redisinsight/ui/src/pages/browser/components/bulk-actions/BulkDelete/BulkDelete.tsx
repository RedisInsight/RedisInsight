import React, { useState } from 'react'
import { EuiButton, EuiIcon, EuiPopover, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import { keysDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { toggleBulkActionTriggered } from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BulkActionsType } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const BulkDelete = (props: Props) => {
  const { onCancel } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { filter, search } = useSelector(keysSelector)
  const { scanned, total } = useSelector(keysDataSelector)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleDelete = () => {
    setIsPopoverOpen(false)
    dispatch(toggleBulkActionTriggered(null))

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_REQUESTED,
      eventData: {
        filterType: filter,
        search,
        scanned,
        total,
        databaseId: instanceId,
        action: BulkActionsType.Delete
      }
    })
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className={styles.container} data-testid="bulk-actions-delete">
      <div className={styles.content} />
      <div className={styles.footer}>
        <EuiButton
          color="secondary"
          onClick={handleCancel}
          className={styles.cancelBtn}
          data-testid="bulk-action-cancel-btn"
        >
          Cancel
        </EuiButton>
        <EuiPopover
          id="bulk-delete-apply-popover"
          anchorPosition="upCenter"
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}
          panelClassName={styles.panelPopover}
          panelPaddingSize="none"
          button={(
            <EuiButton
              fill
              disabled={!search && !filter}
              color="secondary"
              onClick={() => setIsPopoverOpen(true)}
              data-testid="bulk-action-apply-btn"
            >
              Delete
            </EuiButton>
          )}
        >
          <EuiText color="subdued" className={styles.containerPopover}>
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
      </div>
    </div>
  )
}

export default BulkDelete
