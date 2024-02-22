import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import React from 'react'

import Accordion from '../components/accordion'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const InfoPanel = ({ label, value, suffix }: { label: string; value: string; suffix: string }) => (
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

const ProcessingPerformance = () => (
  <Panel>
    <Accordion id="processing-performance-info" title="Processing performance information">
      <>
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <InfoPanel label="Total batches" value="3" suffix="Total" />
              <InfoPanel label="Batch size average" value="1.05" suffix="MB" />
              <InfoPanel label="Process time average" value="0.3" suffix="ms" />
            </EuiFlexGroup>
          </EuiFlexItem>
          <VerticalDivider />
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="s">
              <InfoPanel label="ACK time average" value="0.6" suffix="sec" />
              <InfoPanel label="Records per second average" value="55" suffix="ms" />
              <InfoPanel label="Read time average" value="0.02" suffix="ms" />
            </EuiFlexGroup>
          </EuiFlexItem>
          <VerticalDivider />
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="s" alignItems="flexStart">
              <InfoPanel label="Total time average" value="30" suffix="sec" />
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    </Accordion>
  </Panel>
)

export default ProcessingPerformance
