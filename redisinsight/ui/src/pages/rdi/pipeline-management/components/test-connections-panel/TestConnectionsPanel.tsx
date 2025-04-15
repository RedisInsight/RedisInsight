import React from 'react'
import { EuiButtonIcon, EuiText, EuiLoadingSpinner } from '@elastic/eui'
import { useSelector } from 'react-redux'

import TestConnectionsLog from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-log'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

interface TestConnectionPanelWrapperProps {
  onClose: () => void
  children?: React.ReactNode
}

const TestConnectionPanelWrapper = ({
  children,
  onClose,
}: TestConnectionPanelWrapperProps) => (
  <div className={styles.panel} data-testid="test-connection-panel">
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
    {children}
  </div>
)

export interface Props {
  onClose: () => void
}

const TestConnectionsPanel = (props: Props) => {
  const { onClose } = props
  const { loading, results } = useSelector(rdiTestConnectionsSelector)

  if (loading) {
    return (
      <TestConnectionPanelWrapper onClose={onClose}>
        <Col className={styles.content} centered>
          <FlexItem>
            <EuiText className={styles.loaderText}>Loading results...</EuiText>
          </FlexItem>
          <FlexItem>
            <EuiLoadingSpinner
              data-testid="test-connections-loader"
              className={styles.loaderIcon}
              color="secondary"
              size="xl"
            />
          </FlexItem>
        </Col>
      </TestConnectionPanelWrapper>
    )
  }

  if (!results) {
    return (
      <TestConnectionPanelWrapper onClose={onClose}>
        <EuiText className={styles.subtitle}>
          No results found. Please try again.
        </EuiText>
      </TestConnectionPanelWrapper>
    )
  }

  return (
    <TestConnectionPanelWrapper onClose={onClose}>
      <div className={styles.content}>
        <EuiText
          className={styles.subtitle}
          style={{ marginTop: 16, marginBottom: 10 }}
        >
          Source connections
        </EuiText>

        <TestConnectionsLog data={results.source} />

        <EuiText
          className={styles.subtitle}
          style={{ marginTop: 16, marginBottom: 10 }}
        >
          Target connections
        </EuiText>

        <TestConnectionsLog data={results.target} />
      </div>
    </TestConnectionPanelWrapper>
  )
}

export default TestConnectionsPanel
