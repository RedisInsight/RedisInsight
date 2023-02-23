import React, { useState } from 'react'
import { EuiButton, EuiButtonIcon, EuiFieldText, EuiSpacer, EuiText } from '@elastic/eui'
import UploadFile from 'uiSrc/components/uploadFile'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (data: any) => void
  onCancel: () => void
}
const UploadTutorialForm = (props: Props) => {
  const { onSubmit, onCancel } = props
  const [file, setFile] = useState<any>(null)
  const [name, setName] = useState<string>('')

  const handleFileChange = ({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
    setFile(files?.[0] ?? null)

    if (!name) {
      setName(files?.[0]?.name ? files[0].name.replace(/(\.zip)$/, '') : '')
    }
  }

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.wrapper}>
        <EuiText>Add new Tutorial</EuiText>
        <EuiSpacer size="m" />
        <div>
          <EuiFieldText
            placeholder="Tutorial Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
          {!file && (
            <div className={styles.uploadFileWrapper}>
              <UploadFile onFileChange={handleFileChange} accept=".zip" />
            </div>
          )}
          {file && (
            <div className={styles.uploadFileName}>
              <EuiText color="subdued" size="xs">{file.name}</EuiText>
              <EuiButtonIcon
                style={{ marginLeft: '4px' }}
                size="xs"
                iconSize="s"
                iconType="trash"
                onClick={() => setFile(null)}
                aria-label="remove-file"
              />
            </div>
          )}
          <EuiSpacer size="l" />
          <div className={styles.footer}>
            <EuiButton color="secondary" size="s" onClick={() => onCancel()}>Cancel</EuiButton>
            <EuiButton
              color="secondary"
              size="s"
              fill
              onClick={() => onSubmit({ file, name })}
              style={{ marginLeft: 6 }}
            >
              Submit
            </EuiButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadTutorialForm
