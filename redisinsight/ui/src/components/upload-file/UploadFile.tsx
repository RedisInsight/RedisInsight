import React from 'react'
import { EuiButtonEmpty, EuiText, EuiIcon } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  onFileChange: ({ target: { files } }: { target: { files: FileList | null } }) => void
  onClick: () => void
}

const UploadFile = ({ onFileChange, onClick }: Props) => (
  <EuiButtonEmpty
    className={styles.emptyBtn}
    onClick={onClick}
  >
    <label htmlFor="upload-input-file" className={styles.uploadBtn}>
      <EuiIcon className={styles.icon} type="folderOpen" />
      <EuiText className={styles.label}>Upload</EuiText>
      <input
        type="file"
        id="upload-input-file"
        data-testid="upload-input-file"
        accept="application/json, text/plain"
        onChange={onFileChange}
        className={styles.fileDrop}
        aria-label="Select file"
      />
    </label>
  </EuiButtonEmpty>
)

export default UploadFile
