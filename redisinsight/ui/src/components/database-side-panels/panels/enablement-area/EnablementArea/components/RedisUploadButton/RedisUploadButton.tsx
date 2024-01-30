import { EuiButton, EuiIcon, EuiPopover, EuiSpacer, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { truncateText } from 'uiSrc/utils'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { customTutorialsBulkUploadSelector, uploadDataBulkAction } from 'uiSrc/slices/workbench/wb-custom-tutorials'

import { ReactComponent as BulkDataUploadIcon } from 'uiSrc/assets/img/icons/data-upload-bulk.svg'
import DatabaseNotOpened from 'uiSrc/components/messages/database-not-opened'

import styles from './styles.module.scss'

export interface Props {
  label: string
  path: string
}

const RedisUploadButton = ({ label, path }: Props) => {
  const { pathsInProgress } = useSelector(customTutorialsBulkUploadSelector)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    setIsLoading(pathsInProgress.includes(path))
  }, [pathsInProgress])

  const openPopover = () => {
    if (!isPopoverOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.EXPLORE_PANEL_DATA_UPLOAD_CLICKED,
        eventData: {
          databaseId: instanceId || TELEMETRY_EMPTY_VALUE
        }
      })
    }

    setIsPopoverOpen((v) => !v)
  }

  const uploadData = async () => {
    setIsPopoverOpen(false)
    dispatch(uploadDataBulkAction(instanceId, path))
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_DATA_UPLOAD_SUBMITTED,
      eventData: {
        databaseId: instanceId
      }
    })
  }

  return (
    <div className={cx(styles.wrapper, 'mb-s mt-s')}>
      <EuiPopover
        id="upload-data-bulk-btn"
        anchorPosition="downLeft"
        isOpen={isPopoverOpen}
        closePopover={() => setIsPopoverOpen(false)}
        panelClassName={instanceId ? styles.panelPopover : cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
        anchorClassName={styles.popoverAnchor}
        panelPaddingSize="none"
        button={(
          <EuiButton
            isLoading={isLoading}
            iconType={BulkDataUploadIcon}
            size="s"
            className={styles.button}
            onClick={openPopover}
            fullWidth
            color="secondary"
            data-testid="upload-data-bulk-btn"
          >
            {truncateText(label, 86)}
          </EuiButton>
      )}
      >
        {instanceId ? (
          <EuiText color="subdued" className={styles.containerPopover} data-testid="upload-data-bulk-tooltip">
            <EuiIcon
              type="alert"
              className={styles.popoverIcon}
            />
            <div className={cx(styles.popoverItem, styles.popoverItemTitle)}>
              Execute commands in bulk
            </div>
            <EuiSpacer size="s" />
            <div className={styles.popoverItem}>
              All commands from the file in your tutorial will be automatically executed against your database.
              Avoid executing them in production databases.
            </div>
            <EuiButton
              fill
              size="s"
              color="secondary"
              className={styles.uploadApproveBtn}
              onClick={uploadData}
              data-testid="upload-data-bulk-apply-btn"
            >
              Execute
            </EuiButton>
          </EuiText>
        ) : (<DatabaseNotOpened />)}
      </EuiPopover>
    </div>
  )
}

export default RedisUploadButton
