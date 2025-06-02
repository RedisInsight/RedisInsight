import React from 'react'
import { EuiIcon } from '@elastic/eui'

import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import styles from './styles.module.scss'

export interface Props {
  onFileChange: (string: string) => void
  onClick?: () => void
  accept?: string
  id?: string
}

const UploadFile = (props: Props) => {
  const { onFileChange, onClick, accept, id = 'upload-input-file' } = props

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        onFileChange(e?.target?.result as string)
      }
      reader.readAsText(e.target.files[0])
      // reset input value after reading file
      e.target.value = ''
    }
  }

  return (
    <EmptyButton className={styles.emptyBtn}>
      <label
        htmlFor={id}
        className={styles.uploadBtn}
        data-testid="upload-file-btn"
      >
        <EuiIcon className={styles.icon} type="folderOpen" />
        <Text className={styles.label}>Upload</Text>
        <input
          type="file"
          id={id}
          data-testid={id}
          accept={accept || '*'}
          onChange={handleFileChange}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.()
          }}
          className={styles.fileDrop}
          aria-label="Select file"
        />
      </label>
    </EmptyButton>
  )
}

export default UploadFile
