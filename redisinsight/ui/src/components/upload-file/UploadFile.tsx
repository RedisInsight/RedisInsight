import React from 'react'
import { EuiButtonEmpty, EuiText, EuiIcon } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick?: () => void
  accept?: string
}

const UploadFile = ({ onFileChange, onClick, accept }: Props) => (
  <EuiButtonEmpty
    className={styles.emptyBtn}
    onClick={() => onClick?.()}
  >
    <label htmlFor="upload-input-file" className={styles.uploadBtn}>
      <EuiIcon className={styles.icon} type="folderOpen" />
      <EuiText className={styles.label}>Upload</EuiText>
      <input
        type="file"
        id="upload-input-file"
        data-testid="upload-input-file"
        accept={accept || '*'}
        onChange={onFileChange}
        className={styles.fileDrop}
        aria-label="Select file"
      />
    </label>
  </EuiButtonEmpty>
)

export default UploadFile
