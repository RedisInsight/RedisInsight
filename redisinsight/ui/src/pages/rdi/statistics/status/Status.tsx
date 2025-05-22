import React from 'react'

import { IRdiPipelineStatus } from 'uiSrc/slices/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const StatusItem = ({ label, value }: { label: string; value: string }) => (
  <FlexItem grow>
    <Row gap="m" responsive>
      <FlexItem grow className={styles.statusLabel}>
        <b>{label}</b>
      </FlexItem>
      <FlexItem grow className={styles.statusValue}>
        {value}
      </FlexItem>
    </Row>
  </FlexItem>
)

interface Props {
  data: IRdiPipelineStatus
}

const Status = ({ data }: Props) => (
  <Panel paddingSize="l">
    <Row gap="m" responsive>
      <StatusItem label="Address" value={data.address} />
      <VerticalDivider />
      <StatusItem label="Run status" value={data.runStatus} />
      <VerticalDivider />
      <StatusItem label="Sync Mode" value={data.syncMode} />
    </Row>
  </Panel>
)

export default Status
