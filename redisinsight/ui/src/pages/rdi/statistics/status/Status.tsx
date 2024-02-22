import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import React from 'react'

import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const Status = () => {
  const statusInfo = [
    { label: 'RDI Version', value: '2.0' },
    { label: 'Address', value: '192.168.0.1' },
    { label: 'Run status', value: 'Started' },
    { label: 'Sync Mode', value: 'Streaming' }
  ]

  return (
    <Panel paddingSize="l">
      <EuiFlexGroup>
        {statusInfo.map(({ label, value }, index) => (
          <React.Fragment key={label}>
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem className={styles.statusLabel}>
                  <b>{label}</b>
                </EuiFlexItem>
                <EuiFlexItem className={styles.statusValue}>{value}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            {index < statusInfo.length - 1 && <VerticalDivider />}
          </React.Fragment>
        ))}
      </EuiFlexGroup>
    </Panel>
  )
}

export default Status
