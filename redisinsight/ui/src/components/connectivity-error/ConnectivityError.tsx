import React from 'react'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'
import { PrimaryButton } from 'uiSrc/components/ui/buttons'
import Text from 'uiSrc/components/ui/typography/text'
import Panel from 'uiSrc/components/ui/layout/panel'
import { ColumnGroup, FixedItem } from 'uiSrc/components/ui/layout/flex'

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
  <div className={styles.connectivityError}>
    <Panel height="100%">
      <div style={{ display: 'flex', height: '100%' }}>
        {isLoading && <SuspenseLoader />}
        <ColumnGroup
          gutterSize="xl"
          alignItems="center"
          justifyContent="center"
        >
          <FixedItem data-testid="connectivity-error-message">
            <Text size="XL">{error}</Text>
          </FixedItem>
          {onRetry && (
            <FixedItem>
              <PrimaryButton size="medium" color="secondary" onClick={onRetry}>
                Retry
              </PrimaryButton>
            </FixedItem>
          )}
        </ColumnGroup>
      </div>
    </Panel>
  </div>
)

export default ConnectivityError
