import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'

import styles from './styles.module.scss'

export interface Props {
  actions: JSX.Element
}

const Header = ({ actions }: Props) => {
  const { name = '' } = useSelector(connectedInstanceSelector)

  const history = useHistory()

  const goHome = () => {
    history.push(Pages.rdi)
  }

  return (
    <div className={cx(styles.container)}>
      <EuiFlexGroup style={{ height: '100%' }} gutterSize="none" alignItems="center" responsive={false}>
        <EuiFlexItem style={{ overflow: 'hidden' }}>
          <div className={styles.breadcrumbsContainer} data-testid="breadcrumbs-container">
            <div>
              <EuiToolTip
                position="bottom"
                content="Redis Data Integration"
              >
                <EuiText
                  className={styles.breadCrumbLink}
                  aria-label="Redis Data Integration"
                  data-testid="my-rdi-instances-btn"
                  onClick={goHome}
                  onKeyDown={goHome}
                >
                  RDI instances
                </EuiText>
              </EuiToolTip>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ maxWidth: '100%' }}>
                <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
                  <EuiFlexItem grow={false}>
                    <EuiText className={styles.divider}>&#62;</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem style={{ overflow: 'hidden' }}>
                    <b className={styles.rdiName} data-testid="rdi-instance-name">{name}</b>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </div>
          </div>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {actions}
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default Header
