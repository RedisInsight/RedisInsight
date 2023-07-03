import React from 'react'

import { EuiIcon, EuiTitle, EuiText, EuiSpacer, EuiButton } from '@elastic/eui'
import { ReactComponent as WelcomeIcon } from 'uiSrc/assets/img/icons/welcome.svg'

import styles from './styles.module.scss'

export interface IProps {
  onAddLibrary: () => void
}

const NoLibrariesScreen = ({ onAddLibrary }: IProps) => (
  <div className={styles.wrapper} data-testid="triggered-functions-welcome">
    <div className={styles.container}>
      <EuiIcon type={WelcomeIcon} className={styles.icon} size="original" />
      <EuiSpacer size="m" />
      <EuiTitle size="m" className={styles.title}>
        <h4>Triggers and Functions</h4>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiText color="subdued">See an overview of triggers and functions uploaded, upload new libraries, and manage the list of existing ones.</EuiText>
      <EuiSpacer size="m" />
      <EuiText color="subdued">To start working with triggers and functions, click
        <EuiButton
          fill
          size="s"
          color="secondary"
          onClick={onAddLibrary}
          className={styles.btn}
          data-testid="add-library-no-libraries-btn"
        >
          + Library
        </EuiButton>
        to upload a new library.
      </EuiText>
    </div>
  </div>
)

export default NoLibrariesScreen
