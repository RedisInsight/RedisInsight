import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

import styles from './styles.module.scss'

export type ConnectivityErrorProps = {
  onRetry?: () => void;
  isLoading: boolean;
  error?: string | null;
}

const ConnectivityError = ({ isLoading, error, onRetry }: ConnectivityErrorProps) => (
  <div className={styles.connectivityError}>
    <EuiPanel>
      <div style={{ display: 'flex', height: '100%' }}>
        { isLoading && <SuspenseLoader />}
        <EuiFlexGroup
          gutterSize="l"
          alignItems="center"
          direction="column"
          justifyContent="center"
        >
          <EuiFlexItem grow={false} data-testid="connectivity-error-message">
            {error}
          </EuiFlexItem>
          { onRetry && (
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                size="m"
                color="secondary"
                onClick={onRetry}
              >
                Retry
              </EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </div>
    </EuiPanel>
  </div>
)

export default ConnectivityError
