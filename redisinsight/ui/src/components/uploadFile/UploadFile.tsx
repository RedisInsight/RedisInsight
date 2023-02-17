import React from 'react'
import { EuiButtonEmpty, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  onFileChange: ({ target: { files } }: { target: { files: FileList | null } }) => void
  onClick: () => void
}

const UploadFile = ({ onFileChange, onClick }: Props) => (
  <EuiButtonEmpty
    iconType="folderOpen"
    className={styles.emptyBtn}
  >
    <label htmlFor="upload-input-file" className={styles.uploadBtn}>
      <EuiText className={styles.label}>Upload</EuiText>
      <input
        type="file"
        id="upload-input-file"
        data-testid="upload-input-file"
        accept="application/json, text/plain"
        onChange={onFileChange}
        onClick={onClick}
        className={styles.fileDrop}
        aria-label="Select file"
      />
    </label>
  </EuiButtonEmpty>
)

export default UploadFile
