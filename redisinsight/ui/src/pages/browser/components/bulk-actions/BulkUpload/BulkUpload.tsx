import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButton,
  EuiFilePicker,
  EuiIcon,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'

import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { BulkActionsStatus, BulkActionsType } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  bulkActionsUploadOverviewSelector,
  bulkActionsUploadSelector,
  bulkActionsUploadSummarySelector,
  bulkUploadDataAction,
  setBulkUploadStartAgain,
  uploadController
} from 'uiSrc/slices/browser/bulkActions'

import BulkActionsInfo from 'uiSrc/pages/browser/components/bulk-actions/BulkActionsInfo'
import BulkActionSummary from 'uiSrc/pages/browser/components/bulk-actions/BulkActionSummary'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isProcessedBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import { UploadWarning } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const MAX_MB_FILE = 3_000
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const BulkUpload = (props: Props) => {
  const { onCancel } = props
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { loading, fileName } = useSelector(bulkActionsUploadSelector)
  const { status, progress, duration } = useSelector(bulkActionsUploadOverviewSelector) ?? {}
  const { succeed, processed, failed } = useSelector(bulkActionsUploadSummarySelector) ?? {}

  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const isCompleted = status && status === BulkActionsStatus.Completed

  const dispatch = useDispatch()

  const onStartAgain = () => {
    dispatch(setBulkUploadStartAgain())
    setFiles(null)
    setIsSubmitDisabled(true)
  }

  const handleUploadWarning = () => {
    setIsPopoverOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_WARNING,
      eventData: {
        databaseId: instanceId,
        action: BulkActionsType.Upload
      }
    })
  }

  const onFileChange = (files: Nullable<FileList>) => {
    const isOutOfSize = (files?.[0]?.size || 0) > MAX_FILE_SIZE

    setFiles(files)
    setIsInvalid(!!files?.length && isOutOfSize)
    setIsSubmitDisabled(!files?.length || isOutOfSize)
  }

  const handleUpload = () => {
    if (files) {
      setIsPopoverOpen(false)

      const formData = new FormData()
      formData.append('file', files[0])
      dispatch(bulkUploadDataAction(instanceId, { file: formData, fileName: files[0].name }))
    }
  }

  const handleClickCancel = () => {
    uploadController?.abort()
    onCancel?.()
  }

  return (
    <div className={styles.container} data-testid="bulk-upload-container">
      {!isCompleted ? (
        <div className={styles.content}>
          <EuiText color="subdued">
            Upload the text file with the list of Redis commands
            <EuiToolTip
              content={(
                <>
                  <EuiText size="xs">SET Key0 Value0</EuiText>
                  <EuiText size="xs">SET Key1 Value1</EuiText>
                  <EuiText size="xs">...</EuiText>
                  <EuiText size="xs">SET KeyN ValueN</EuiText>
                </>
              )}
              data-testid="bulk-upload-tooltip-example"
            >
              <EuiIcon type="iInCircle" style={{ marginLeft: 4, marginBottom: 2 }} />
            </EuiToolTip>
          </EuiText>
          <EuiSpacer size="l" />
          <EuiFilePicker
            id="bulk-upload-file-input"
            initialPromptText="Select or drag and drop a file"
            className={styles.fileDrop}
            isInvalid={isInvalid}
            onChange={onFileChange}
            display="large"
            data-testid="bulk-upload-file-input"
            aria-label="Select or drag and drop file"
          />
          {isInvalid && (
            <EuiTextColor color="danger" className={styles.errorFileMsg} data-testid="input-file-error-msg">
              File should not exceed {MAX_MB_FILE} MB
            </EuiTextColor>
          )}
          <UploadWarning />
          <EuiSpacer size="l" />
        </div>
      ) : (
        <BulkActionsInfo
          loading={loading}
          status={status}
          progress={progress}
          title="Commands executed from file"
          subTitle={(<div className="truncateText" style={{ paddingTop: 6 }}>{fileName}</div>)}
        >
          <BulkActionSummary
            type={BulkActionsType.Upload}
            succeed={succeed}
            processed={processed}
            failed={failed}
            duration={duration}
            data-testid="bulk-upload-completed-summary"
          />
        </BulkActionsInfo>
      )}
      <div className={styles.footer}>
        <EuiButton
          color="secondary"
          onClick={handleClickCancel}
          className={styles.cancelBtn}
          data-testid="bulk-action-cancel-btn"
        >
          {isProcessedBulkAction(status) ? 'Close' : 'Cancel'}
        </EuiButton>
        {!isCompleted ? (
          <EuiPopover
            id="bulk-upload-warning-popover"
            anchorPosition="upCenter"
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}
            panelClassName={styles.panelPopover}
            panelPaddingSize="none"
            button={(
              <EuiButton
                fill
                color="secondary"
                onClick={handleUploadWarning}
                disabled={isSubmitDisabled || loading}
                isLoading={loading}
                data-testid="bulk-action-warning-btn"
              >
                Upload
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
                All commands from the file will be executed against your database.
              </div>
              <EuiButton
                fill
                size="s"
                color="secondary"
                className={styles.uploadApproveBtn}
                onClick={handleUpload}
                data-testid="bulk-action-apply-btn"
              >
                Upload
              </EuiButton>
            </EuiText>
          </EuiPopover>
        ) : (
          <EuiButton
            fill
            iconType="refresh"
            color="secondary"
            onClick={onStartAgain}
            data-testid="bulk-action-start-new-btn"
          >
            Start New
          </EuiButton>
        )}
      </div>
    </div>
  )
}

export default BulkUpload
