import React from 'react'
import { EuiButton, EuiPanel } from '@elastic/eui'

import CreateTutorialLink from '../CreateTutorialLink'

import styles from './styles.module.scss'

export interface Props {
  handleOpenUpload: () => void
}

const WelcomeMyTutorials = ({ handleOpenUpload }: Props) => (
  <div className={styles.wrapper} data-testid="welcome-my-tutorials">
    <EuiPanel hasBorder={false} hasShadow={false} className={styles.panel} paddingSize="s">
      <div className={styles.link}>
        <CreateTutorialLink />
      </div>
      <EuiButton
        className={styles.btnSubmit}
        color="secondary"
        size="s"
        fill
        onClick={() => handleOpenUpload()}
        data-testid="upload-tutorial-btn"
      >
        + Upload <span className={styles.hideText}>tutorial</span>
      </EuiButton>
    </EuiPanel>
  </div>
)

export default WelcomeMyTutorials
