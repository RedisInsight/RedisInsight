import {
  EuiButton,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiText,
  EuiTitle
} from '@elastic/eui'
import React, { useState } from 'react'

import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
  onConfirm: () => void
  onFileChange: (file: File) => void
}

const UploadDialog = ({ onClose, onConfirm, onFileChange }: Props) => {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      onFileChange(files[0])
    }
    setIsSubmitDisabled(!files?.length)
  }

  return (
    <EuiModal onClose={onClose} className={styles.modal} data-testid="upload-rdi-pipeline-dialog">
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiTitle size="xs" data-testid="upload-rdi-pipeline-dialog-title">
            <span>Upload an archive with an RDI pipeline</span>
          </EuiTitle>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup justifyContent="center" gutterSize="none" responsive={false}>
          <EuiFlexItem grow={false} style={{ maxWidth: '100%' }}>
            <EuiFilePicker
              id="upload-rdi-pipeline-file-picker"
              initialPromptText="Select or drag and drop a file"
              className={styles.fileDrop}
              onChange={handleFileChange}
              display="large"
              accept=".zip"
              data-testid="upload-rdi-pipeline-file-picker"
              aria-label="Select or drag and drop a file"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup justifyContent="center" gutterSize="none" responsive={false}>
          <EuiFlexItem>
            <EuiText>
              If a new pipeline is uploaded, existing pipeline configuration and transformation jobs will be
              overwritten. Changes will not be applied until the pipeline is deployed.
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton color="secondary" onClick={onClose} data-testid="cancel-btn">
          Cancel
        </EuiButton>
        <EuiButton color="secondary" onClick={onConfirm} fill isDisabled={isSubmitDisabled} data-testid="submit-btn">
          Upload
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}

export default UploadDialog
