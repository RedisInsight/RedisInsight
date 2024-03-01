import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import React from 'react'

import { IProcessingPerformance } from 'uiSrc/slices/interfaces'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const InfoPanel = ({ label, value, suffix }: { label: string; value: number; suffix: string }) => (
  <EuiFlexItem className={styles.infoPanel}>
    <EuiFlexGroup>
      <EuiFlexItem className={styles.infoLabel}>{label}</EuiFlexItem>
      <EuiFlexItem className={styles.infoValue} grow={false}>
        {value}
      </EuiFlexItem>
      <EuiFlexItem className={styles.infoSuffix} grow={false}>
        {suffix}
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiFlexItem>
)

interface Props {
  data: IProcessingPerformance
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const ProcessingPerformance = ({
  data: { totalBatches, batchSizeAvg, processTimeAvg, ackTimeAvg, recPerSecAvg, readTimeAvg, totalTimeAvg },
  loading,
  onRefresh,
  onRefreshClicked,
  onChangeAutoRefresh
}: Props) => (
  <Panel>
    <Accordion
      id="processing-performance-info"
      title="Processing performance information"
      loading={loading}
      onRefresh={onRefresh}
      onRefreshClicked={onRefreshClicked}
      onChangeAutoRefresh={onChangeAutoRefresh}
      enableAutoRefreshDefault
    >
      <>
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s" responsive={false}>
              <InfoPanel label="Total batches" value={totalBatches} suffix="Total" />
              <InfoPanel label="Batch size average" value={batchSizeAvg} suffix="MB" />
              <InfoPanel label="Process time average" value={processTimeAvg} suffix="ms" />
            </EuiFlexGroup>
          </EuiFlexItem>
          <VerticalDivider />
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s" responsive={false}>
              <InfoPanel label="ACK time average" value={ackTimeAvg} suffix="sec" />
              <InfoPanel label="Records per second average" value={recPerSecAvg} suffix="/sec" />
              <InfoPanel label="Read time average" value={readTimeAvg} suffix="ms" />
            </EuiFlexGroup>
          </EuiFlexItem>
          <VerticalDivider />
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="s" alignItems="flexStart" responsive={false}>
              <InfoPanel label="Total time average" value={totalTimeAvg} suffix="sec" />
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    </Accordion>
  </Panel>
)

export default ProcessingPerformance
