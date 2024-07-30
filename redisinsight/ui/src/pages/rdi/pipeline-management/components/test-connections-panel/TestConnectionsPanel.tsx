import React from 'react'
import {
  EuiButtonIcon,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
} from '@elastic/eui'
import { useSelector } from 'react-redux'

import TestConnectionsLog from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-log'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
}

const TestConnectionsPanel = (props: Props) => {
  const { onClose } = props
  const { loading: testingConnections, results } = useSelector(rdiTestConnectionsSelector)

  return (
    <div
      className={styles.panel}
      data-testid="test-connection-panel"
    >
      <div className={styles.header}>
        <EuiText className={styles.title}>Connection test results</EuiText>
        <EuiButtonIcon
          iconSize="m"
          iconType="cross"
          color="primary"
          aria-label="close test connections panel"
          className={styles.closeBtn}
          onClick={onClose}
          data-testid="close-test-connections-btn"
        />
      </div>
      {testingConnections && (
        <EuiFlexGroup
          className={styles.content}
          alignItems="center"
          justifyContent="center"
          direction="column"
          gutterSize="none"
        >
          <EuiFlexItem grow={false}>
            <EuiText className={styles.loaderText}>Loading results...</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner data-testid="test-connections-loader" className={styles.loaderIcon} color="secondary" size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      {!testingConnections && (
        <div className={styles.content}>
          <TestConnectionsLog data={results} />
        </div>
      )}
    </div>
  )
}

export default TestConnectionsPanel
