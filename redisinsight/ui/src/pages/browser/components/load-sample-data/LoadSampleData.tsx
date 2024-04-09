import React, { useState } from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPopover, EuiSpacer, EuiText } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { bulkActionsSelector, bulkImportDefaultDataAction } from 'uiSrc/slices/browser/bulkActions'
import { changeKeyViewType, fetchKeys, keysSelector } from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

const LoadSampleData = () => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const { id } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(bulkActionsSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()

  const handleSampleData = () => {
    setIsConfirmationOpen(false)
    dispatch(
      bulkImportDefaultDataAction(
        id,
        () => {
          if (viewType === KeyViewType.Browser) {
            dispatch(changeKeyViewType(KeyViewType.Tree))
          }
          dispatch(fetchKeys({
            searchMode: SearchMode.Pattern,
            cursor: '0',
            count: SCAN_TREE_COUNT_DEFAULT
          }))
        }
      )
    )

    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_IMPORT_SAMPLES_CLICKED,
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
      anchorClassName={styles.buttonWrapper}
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
