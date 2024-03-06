import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import React from 'react'

import { IRdiPipelineStatus } from 'uiSrc/slices/interfaces'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const StatusItem = ({ label, value }: { label: string; value: string }) => (
  <EuiFlexItem>
    <EuiFlexGroup>
      <EuiFlexItem className={styles.statusLabel}>
        <b>{label}</b>
      </EuiFlexItem>
      <EuiFlexItem className={styles.statusValue}>{value}</EuiFlexItem>
    </EuiFlexGroup>
  </EuiFlexItem>
)

interface Props {
  data: IRdiPipelineStatus
}

const Status = ({ data }: Props) => (
  <Panel paddingSize="l">
    <EuiFlexGroup>
      <StatusItem label="RDI Version" value={data.rdiVersion} />
      <VerticalDivider />
      <StatusItem label="Address" value={data.address} />
      <VerticalDivider />
      <StatusItem label="Run status" value={data.runStatus} />
      <VerticalDivider />
      <StatusItem label="Sync Mode" value={data.syncMode} />
    </EuiFlexGroup>
  </Panel>
)

export default Status
