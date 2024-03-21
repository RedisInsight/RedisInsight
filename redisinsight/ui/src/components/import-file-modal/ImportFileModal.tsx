import {
  EuiButton,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
  EuiTextColor,
  EuiTitle
} from '@elastic/eui'
import cx from 'classnames'
import React from 'react'

import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props<T> {
  onClose: () => void
  onFileChange: (files: FileList | null) => void
  onSubmit: () => void
  modalClassName?: string
  title: string
  resultsTitle?: string
  submitResults: JSX.Element
  loading: boolean
  data: Nullable<T>
  warning?: JSX.Element | null
  error?: string
  errorMessage?: string
  invalidMessage?: string
  isInvalid: boolean
  isSubmitDisabled: boolean
  submitBtnText?: string
  acceptedFileExtension?: string
}

const ImportFileModal = <T,>({
  onClose,
  onFileChange,
  onSubmit,
  modalClassName,
  title,
  resultsTitle,
  submitResults,
  loading,
  data,
  warning,
  error,
  errorMessage,
  invalidMessage,
  isInvalid,
  isSubmitDisabled,
  submitBtnText,
  acceptedFileExtension
}: Props<T>) => {
  const isShowForm = !loading && !data && !error
  return (
    <EuiModal
      onClose={onClose}
      className={cx(styles.modal, modalClassName)}
      data-testid="import-file-modal"
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size="xs" data-testid="import-file-modal-title">
            <span>{!data && !error ? title : resultsTitle || 'Import Results'}</span>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiFlexGroup alignItems="center" gutterSize="none" responsive={false} direction="column">
          {warning && (
            <EuiFlexItem grow={false}>
              {warning}
            </EuiFlexItem>
          )}
          <EuiFlexItem grow={false}>
            {isShowForm && (
              <>
                <EuiFilePicker
                  id="import-file-modal-filepicker"
                  initialPromptText="Select or drag and drop a file"
                  className={styles.fileDrop}
                  isInvalid={isInvalid}
                  onChange={onFileChange}
                  display="large"
                  accept={acceptedFileExtension}
                  data-testid="import-file-modal-filepicker"
                  aria-label="Select or drag and drop file"
                />
                {isInvalid && (
                  <EuiTextColor color="danger" className={styles.errorFileMsg} data-testid="input-file-error-msg">
                    {invalidMessage}
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
                  {errorMessage}
                </EuiText>
                <EuiText color="subdued">{error}</EuiText>
              </div>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        {data && (
          <EuiFlexGroup justifyContent="center" gutterSize="none" responsive={false}>
            <EuiFlexItem style={{ maxWidth: '100%' }}>{submitResults}</EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiModalBody>

      {data && (
        <EuiModalFooter>
          <EuiButton color="secondary" onClick={onClose} fill data-testid="ok-btn">
            Ok
          </EuiButton>
        </EuiModalFooter>
      )}

      {isShowForm && (
        <EuiModalFooter>
          <EuiButton color="secondary" onClick={onClose} data-testid="cancel-btn">
            Cancel
          </EuiButton>

          <EuiButton color="secondary" onClick={onSubmit} fill isDisabled={isSubmitDisabled} data-testid="submit-btn">
            {submitBtnText || 'Import'}
          </EuiButton>
        </EuiModalFooter>
      )}
    </EuiModal>
  )
}

export default ImportFileModal
