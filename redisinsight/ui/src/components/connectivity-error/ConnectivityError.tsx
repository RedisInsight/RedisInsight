import React from 'react'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'
import { PrimaryButton } from 'uiSrc/components/ui/buttons'
import { Text } from 'uiSrc/components/ui/typography/text'
import Panel from 'uiSrc/components/ui/layout/panel'
import { Column, FixedItem, Row } from 'uiSrc/components/ui/layout/flex'

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
      <Row full>
        {isLoading && <SuspenseLoader />}
        <Column gutterSize="xl" contentCentered>
          <FixedItem data-testid="connectivity-error-message">
            <Text size="XL">{error}</Text>
          </FixedItem>
          {onRetry && (
            <FixedItem>
              <PrimaryButton size="medium" onClick={onRetry}>
                Retry
              </PrimaryButton>
            </FixedItem>
          )}
        </Column>
      </Row>
    </Panel>
  </div>
)

export default ConnectivityError
