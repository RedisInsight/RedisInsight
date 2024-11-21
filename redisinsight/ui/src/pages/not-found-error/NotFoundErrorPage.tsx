import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui'
import styles from './styles.module.scss'

const NotFoundErrorPage = () => (
  <div className={styles.notfoundpage}>
    <EuiPanel>
      <div style={{
        display: 'flex',
        height: '100%'
      }}>
        <EuiFlexGroup
          gutterSize="l"
          alignItems="center"
          direction="column"
          justifyContent="center"
        >
          <EuiFlexItem grow={false} data-testid="not-found-page">
            Page not found.
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPanel>
  </div>
)

export default NotFoundErrorPage
