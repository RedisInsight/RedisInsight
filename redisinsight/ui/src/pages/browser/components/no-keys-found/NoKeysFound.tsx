import React, { useContext } from 'react'
import { EuiTitle, EuiText, EuiSpacer, EuiButton, EuiImage } from '@elastic/eui'
import { useDispatch } from 'react-redux'

import { setBulkActionType } from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import TelescopeDark from 'uiSrc/assets/img/telescope-dark.svg'
import TelescopeLight from 'uiSrc/assets/img/telescope-light.svg'

import styles from './styles.module.scss'

export interface Props {
  onAddKeyPanel: (value: boolean) => void
  onBulkActionsPanel: (value: boolean) => void
}

const NoKeysFound = (props: Props) => {
  const { onAddKeyPanel, onBulkActionsPanel } = props

  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const handleOpenBulkUpload = () => {
    onBulkActionsPanel(true)
    dispatch(setBulkActionType(BulkActionsType.Upload))
  }

  return (
    <div className={styles.container} data-testid="no-result-found-msg">
      <EuiImage
        className={styles.img}
        src={theme === Theme.Dark ? TelescopeDark : TelescopeLight}
        alt="no results image"
      />
      <EuiSpacer size="l" />
      <EuiText>No Keys Found</EuiText>
      <EuiSpacer size="m" />
      <EuiTitle className={styles.title} size="s">
        <span>Create your first key to get started</span>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiText>
        Keys are the foundation of Redis. Create your first key to start exploring Redis and Redis Stack capabilities
      </EuiText>
      <EuiSpacer size="l" />
      <div className={styles.actions}>
        <EuiButton
          fill
          color="secondary"
          onClick={() => onAddKeyPanel(true)}
          className={styles.addKey}
          data-testid="add-key-msg-btn"
        >
          + Key
        </EuiButton>
        <span>or</span>
        <EuiButton
          color="secondary"
          onClick={() => handleOpenBulkUpload()}
          className={styles.uploadBtn}
          data-testid="upload-data-msg-btn"
        >
          Upload your data
        </EuiButton>
      </div>
    </div>
  )
}

export default NoKeysFound
