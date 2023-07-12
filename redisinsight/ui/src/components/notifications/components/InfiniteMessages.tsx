import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

export enum InfiniteMessagesIds {
  oAuth = 'oAuth'
}

export const INFINITE_MESSAGES = {
  SUCCESS_CREATE_DB: (onSuccess: () => void) => ({
    id: InfiniteMessagesIds.oAuth,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => { e.preventDefault() }}
        onMouseUp={(e) => { e.preventDefault() }}
        data-testid="success-create-db-notification"
      >
        <EuiTitle className="infiniteMessage__title"><span>Success!</span></EuiTitle>
        <EuiText size="xs">
          Your new database was created successfully.
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
              Connect
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }),
}
