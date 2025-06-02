import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import ExploreGuides from 'uiSrc/components/explore-guides'
import { Nullable } from 'uiSrc/utils'

import { toggleBrowserFullScreen } from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  keyProp: Nullable<RedisResponseBuffer>
  totalKeys: number
  keysLastRefreshTime: Nullable<number>
  onClosePanel: () => void
  error?: string
}

export const NoKeySelected = (props: Props) => {
  const { keyProp, totalKeys, onClosePanel, error, keysLastRefreshTime } = props

  const dispatch = useDispatch()

  const handleClosePanel = () => {
    dispatch(toggleBrowserFullScreen(true))
    keyProp && onClosePanel()
  }

  const NoKeysSelectedMessage = () => (
    <>
      {totalKeys > 0 ? (
        <span data-testid="select-key-message">
          Select the key from the list on the left to see the details of the
          key.
        </span>
      ) : (
        <ExploreGuides />
      )}
    </>
  )

  return (
    <>
      <EuiToolTip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <IconButton
          icon={CancelSlimIcon}
          aria-label="Close panel"
          className={styles.closeBtn}
          onClick={handleClosePanel}
          data-testid="close-right-panel-btn"
        />
      </EuiToolTip>

      <div className={styles.placeholder}>
        <Text textAlign="center" color="subdued" size="s">
          {error ? (
            <span data-testid="no-keys-selected-text">{error}</span>
          ) : (
            !!keysLastRefreshTime && <NoKeysSelectedMessage />
          )}
        </Text>
      </div>
    </>
  )
}
