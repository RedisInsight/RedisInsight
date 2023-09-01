import React from 'react'
import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
} from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { appActionBarSelector, setActionBarInitialState } from 'uiSrc/slices/app/actionBar'
import { ActionBarStatus } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

const GlobalActionBar = () => {
  const { status, actions = [], text = '' } = useSelector(appActionBarSelector)

  const dispatch = useDispatch()

  if (status === ActionBarStatus.Close) return null

  const onCloseActionBar = () => {
    dispatch(setActionBarInitialState())
  }

  return (
    <div className={styles.container}>
      <EuiFlexGroup
        justifyContent="center"
        alignItems="center"
        className={styles.content}
        gutterSize="none"
        responsive={false}
      >
        { status === ActionBarStatus.Success && <EuiIcon type="checkInCircleFilled" className={styles.icon} />}
        { status === ActionBarStatus.Progress && <EuiLoadingSpinner className={styles.icon} />}
        <EuiFlexItem className={styles.text}>
          {text}
        </EuiFlexItem>
        <EuiFlexItem grow={false} className={styles.actions}>
          {actions?.map(({ label, onClick }) => (
            <EuiButton
              fill
              size="s"
              color="secondary"
              className={styles.action}
              onClick={onClick}
              data-testid={`global-action-button-${label}`}
              key={label}
            >
              {label}
            </EuiButton>
          ))}
        </EuiFlexItem>
        <EuiFlexItem grow={false} className={styles.cross}>
          <EuiButtonIcon
            iconType="cross"
            color="primary"
            aria-label="close global action bar"
            onClick={onCloseActionBar}
            data-testid="close-global-action-bar"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default GlobalActionBar
