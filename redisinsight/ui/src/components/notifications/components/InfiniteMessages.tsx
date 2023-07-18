import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

export enum InfiniteMessagesIds {
  oAuth = 'oAuth'
}

export const INFINITE_MESSAGES = {
  PENDING_CREATE_DB: ({
    id: InfiniteMessagesIds.oAuth,
    Inner: (
      <div
        role="presentation"
        data-testid="pending-create-db-notification"
      >
        <EuiFlexGroup justifyContent="flexEnd" direction="row" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner className="infiniteMessage__icon" />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle className="infiniteMessage__title">
              <span>
                Setting up your Redis Enterprise Cloud account...
              </span>
            </EuiTitle>
            <EuiText size="xs">
              This may take several minutes, but it is totally worth it!
            </EuiText>
            <EuiSpacer size="m" />
            <EuiText size="xs">
              You can continue working in RedisInsight, and we will notify you once done.
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
  SUCCESS_CREATE_DB: (onSuccess: () => void) => ({
    id: InfiniteMessagesIds.oAuth,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="success-create-db-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>Congratulations!</span></EuiTitle>
        <EuiText size="xs">
          You can now use your Redis Stack database in Redis Enterprise Cloud
          to start exploring all its developer capabilities via RedisInsight tutorials.
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              onClick={() => onSuccess()}
              data-testid="notification-connect-db"
            >
              Get started
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
}
