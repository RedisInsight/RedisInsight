import React from 'react'
import {
  EuiTitle,
  EuiSpacer,
  EuiImage,
  EuiButtonEmpty,
} from '@elastic/eui'
import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg'

import LoadSampleData from '../load-sample-data'
import styles from './styles.module.scss'

export interface Props {
  onAddKeyPanel: (value: boolean) => void
}

const NoKeysFound = (props: Props) => {
  const { onAddKeyPanel } = props

  return (
    <div className={styles.container} data-testid="no-result-found-msg">
      <EuiImage
        className={styles.img}
        src={TelescopeImg}
        alt="no results image"
      />
      <EuiSpacer size="l" />
      <EuiTitle className={styles.title} size="s">
        <span>Let&apos;s start working</span>
      </EuiTitle>
      <EuiSpacer size="l" />
      <div className={styles.actions}>
        <LoadSampleData />
        <EuiButtonEmpty
          onClick={() => onAddKeyPanel(true)}
          className={styles.addKey}
          data-testid="add-key-msg-btn"
        >
          + Add key manually
        </EuiButtonEmpty>
      </div>
    </div>
  )
}

export default NoKeysFound
