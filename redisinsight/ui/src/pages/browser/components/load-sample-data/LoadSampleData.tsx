import React, { useState } from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPopover, EuiSpacer, EuiText } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { bulkActionsSelector, bulkImportDefaultDataAction } from 'uiSrc/slices/browser/bulkActions'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

export interface Props {
  anchorClassName?: string
  onSuccess?: () => void
}

const LoadSampleData = (props: Props) => {
  const { anchorClassName, onSuccess } = props
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const { id } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(bulkActionsSelector)

  const dispatch = useDispatch()

  const handleSampleData = () => {
    setIsConfirmationOpen(false)
    dispatch(bulkImportDefaultDataAction(id, onSuccess))

    sendEventTelemetry({
      event: TelemetryEvent.IMPORT_SAMPLES_CLICKED,
      eventData: {
        databaseId: id
      }
    })
  }

  return (
    <EuiPopover
      ownFocus
      initialFocus={false}
      id="load-sample-data-popover"
      anchorPosition="upCenter"
      isOpen={isConfirmationOpen}
      closePopover={() => setIsConfirmationOpen(false)}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
      panelPaddingSize="none"
      anchorClassName={cx(styles.buttonWrapper, anchorClassName)}
      button={(
        <EuiButton
          fill
          color="secondary"
          onClick={() => setIsConfirmationOpen(true)}
          className={styles.loadDataBtn}
          isLoading={loading}
          isDisabled={loading}
          data-testid="load-sample-data-btn"
        >
          Load sample data
        </EuiButton>
      )}
    >
      <EuiFlexGroup gutterSize="s" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon
            type="alert"
            className={styles.popoverIcon}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText>Execute commands in bulk</EuiText>
          <EuiSpacer size="s" />
          <EuiText color="subdued" size="s">
            All commands from the file will be automatically executed against your database.
            Avoid executing them in production databases.
          </EuiText>
          <EuiSpacer size="s" />
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                size="s"
                iconType="playFilled"
                iconSide="right"
                color="secondary"
                onClick={handleSampleData}
                data-testid="load-sample-data-btn-confirm"
              >
                Execute
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  )
}

export default LoadSampleData
