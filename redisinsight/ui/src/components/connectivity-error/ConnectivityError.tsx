import React from 'react'
import { EuiButton, EuiPanel } from '@elastic/eui'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

export type ConnectivityErrorProps = {
  onRetry?: () => void
  isLoading: boolean
  error?: string | null
}

const ConnectivityError = ({
  isLoading,
  error,
  onRetry,
}: ConnectivityErrorProps) => (
  <Col className={styles.connectivityError}>
    <EuiPanel>
      <Col style={{ minHeight: '100vh' }} centered>
        {isLoading && <SuspenseLoader />}
        <Col centered gap="xl">
          <FlexItem data-testid="connectivity-error-message">{error}</FlexItem>
          {onRetry && (
            <FlexItem>
              <EuiButton fill size="m" color="secondary" onClick={onRetry}>
                Retry
              </EuiButton>
            </FlexItem>
          )}
        </Col>
      </Col>
    </EuiPanel>
  </Col>
)

export default ConnectivityError
