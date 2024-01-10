import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
  EuiText,
  EuiButton,
} from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'

import styles from './styles.module.scss'

const RdiPipelineHeader = () => {
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
                content="My RDI instances"
              >
                <EuiText
                  className={styles.breadCrumbLink}
                  aria-label="My RDI instances"
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
        <EuiFlexItem style={{ paddingLeft: 6 }} grow={false}>
          <EuiButton fill size="s" color="secondary" onClick={() => {}} data-testid="deploy-rdi-pipeline">
            Deploy Pipeline
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default RdiPipelineHeader
