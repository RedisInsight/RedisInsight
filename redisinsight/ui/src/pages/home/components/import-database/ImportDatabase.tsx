import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButton,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  EuiTextColor, EuiTitle, EuiToolTip
} from '@elastic/eui'
import ReactDOM from 'react-dom'
import {
  fetchInstancesAction,
  importInstancesSelector,
  resetImportInstances,
  uploadInstancesFile
} from 'uiSrc/slices/instances/instances'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { UploadWarning } from 'uiSrc/components'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import ResultsLog from './components/ResultsLog'

import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
}

const MAX_MB_FILE = 10
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const ImportDatabase = (props: Props) => {
  const { onClose } = props
  const { loading, data, error } = useSelector(importInstancesSelector)
  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [domReady, setDomReady] = useState(false)

  const dispatch = useDispatch()
  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setDomReady(true)

    setModalHeader(
      <EuiTitle size="s"><h4>Import from file</h4></EuiTitle>,
      true
    )

    return () => {
      setModalHeader(null)
    }
  }, [])

  const onFileChange = (files: FileList | null) => {
    setFiles(files)
    setIsInvalid(!!files?.length && files?.[0].size > MAX_FILE_SIZE)
    setIsSubmitDisabled(!files?.length || files[0].size > MAX_FILE_SIZE)
  }

  const handleOnClose = () => {
    onClose()
    dispatch(resetImportInstances())

    if (!data) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CANCELLED,
      })
    }
  }

  const onClickRetry = () => {
    dispatch(resetImportInstances())
    onFileChange(null)
  }

  const onSubmit = () => {
    if (files) {
      const formData = new FormData()
      formData.append('file', files[0])

      dispatch(uploadInstancesFile(
        formData,
        (data) => {
          if (data?.success?.length || data?.partial?.length) {
            dispatch(fetchInstancesAction())
          }
        }
      ))

      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED
      })
    }
  }

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')
    if (!domReady || !footerEl) return null

    if (error) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          <EuiButton
            fill
            size="s"
            color="secondary"
            onClick={onClickRetry}
            data-testid="btn-retry"
          >
            Retry
          </EuiButton>
        </div>,
        footerEl
      )
    }

    if (data) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          <EuiButton
            fill
            size="s"
            color="secondary"
            type="submit"
            onClick={handleOnClose}
            data-testid="btn-close"
          >
            Ok
          </EuiButton>
        </div>,
        footerEl
      )
    }

    return ReactDOM.createPortal(
      <div className="footerAddDatabase">
        <EuiButton
          size="s"
          color="secondary"
          className="btn-cancel"
          onClick={handleOnClose}
          style={{ marginRight: 12 }}
        >
          Cancel
        </EuiButton>
        <EuiToolTip
          position="top"
          anchorClassName="euiToolTip__btn-disabled"
          content={isSubmitDisabled ? 'Upload a file' : undefined}
        >
          <EuiButton
            fill
            size="s"
            color="secondary"
            type="submit"
            onClick={onSubmit}
            isLoading={loading}
            disabled={isSubmitDisabled}
            iconType={isSubmitDisabled ? 'iInCircle' : undefined}
            data-testid="btn-submit"
          >
            Submit
          </EuiButton>
        </EuiToolTip>
      </div>,
      footerEl
    )
  }

  const isShowForm = !loading && !data && !error

  return (
    <>
      <div className={styles.formWrapper} data-testid="add-db_import">
        <EuiFlexGroup gutterSize="none" responsive={false} direction="column">
          <EuiFlexItem>
            {isShowForm && (
              <>
                <EuiText color="subdued" size="s">
                  Use a JSON file to import your database connections.
                  Ensure that you only use files from trusted sources to
                  prevent the risk of automatically executing malicious code.
                </EuiText>
                <EuiSpacer />
                <EuiFilePicker
                  id="import-file-modal-filepicker"
                  initialPromptText="Select or drag and drop a file"
                  className={styles.fileDrop}
                  isInvalid={isInvalid}
                  onChange={onFileChange}
                  display="large"
                  data-testid="import-file-modal-filepicker"
                  aria-label="Select or drag and drop file"
                />
                {isInvalid && (
                  <EuiTextColor color="danger" className={styles.errorFileMsg} data-testid="input-file-error-msg">
                    {`File should not exceed ${MAX_MB_FILE} MB`}
                  </EuiTextColor>
                )}
              </>
            )}
            {loading && (
              <div className={styles.loading} data-testid="file-loading-indicator">
                <EuiLoadingSpinner size="xl" />
                <EuiText color="subdued" style={{ marginTop: 12 }}>
                  Uploading...
                </EuiText>
              </div>
            )}
            {error && (
              <div className={styles.result} data-testid="result-failed">
                <EuiIcon type="crossInACircleFilled" size="xxl" color="danger" />
                <EuiText color="subdued" style={{ marginTop: 16 }}>
                  Failed to add database connections
                </EuiText>
                <EuiText color="subdued">{error}</EuiText>
              </div>
            )}
          </EuiFlexItem>
          {isShowForm && (
            <EuiFlexItem className={styles.uploadWarningContainer}>
              <UploadWarning />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        {data && (
          <EuiFlexGroup justifyContent="center" gutterSize="none" responsive={false}>
            <EuiFlexItem style={{ maxWidth: '100%' }}>
              <ResultsLog data={data} />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </div>
      <Footer />
    </>
  )
}

export default ImportDatabase
