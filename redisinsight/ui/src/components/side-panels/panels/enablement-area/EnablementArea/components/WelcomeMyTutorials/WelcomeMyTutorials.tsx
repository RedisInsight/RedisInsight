import React from 'react'
import { EuiPanel } from '@elastic/eui'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import CreateTutorialLink from '../CreateTutorialLink'

import styles from './styles.module.scss'

export interface Props {
  handleOpenUpload: () => void
}

const WelcomeMyTutorials = ({ handleOpenUpload }: Props) => (
  <div className={styles.wrapper} data-testid="welcome-my-tutorials">
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      className={styles.panel}
      paddingSize="s"
    >
      <div className={styles.link}>
        <CreateTutorialLink />
      </div>
      <PrimaryButton
        className={styles.btnSubmit}
        size="s"
        onClick={() => handleOpenUpload()}
        data-testid="upload-tutorial-btn"
      >
        + Upload <span className={styles.hideText}>tutorial</span>
      </PrimaryButton>
    </EuiPanel>
  </div>
)

export default WelcomeMyTutorials
