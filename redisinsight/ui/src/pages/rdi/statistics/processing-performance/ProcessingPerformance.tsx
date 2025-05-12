import React from 'react'

import { IProcessingPerformance } from 'uiSrc/slices/interfaces'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const InfoPanel = ({
  label,
  value,
  suffix,
}: {
  label: string
  value: number
  suffix: string
}) => (
  <FlexItem grow className={styles.infoPanel}>
    <Row gap="m" responsive>
      <FlexItem grow className={styles.infoLabel}>
        {label}
      </FlexItem>
      <FlexItem className={styles.infoValue}>{value}</FlexItem>
      <FlexItem className={styles.infoSuffix}>{suffix}</FlexItem>
    </Row>
  </FlexItem>
)

interface Props {
  data: IProcessingPerformance
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const ProcessingPerformance = ({
  data: {
    totalBatches,
    batchSizeAvg,
    processTimeAvg,
    ackTimeAvg,
    recPerSecAvg,
    readTimeAvg,
    totalTimeAvg,
  },
  loading,
  onRefresh,
  onRefreshClicked,
  onChangeAutoRefresh,
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
        <Row responsive gap="s">
          <FlexItem grow>
            <Col gap="s">
              <InfoPanel
                label="Total batches"
                value={totalBatches}
                suffix="Total"
              />
              <InfoPanel
                label="Batch size average"
                value={batchSizeAvg}
                suffix="MB"
              />
              <InfoPanel
                label="Process time average"
                value={processTimeAvg}
                suffix="ms"
              />
            </Col>
          </FlexItem>
          <VerticalDivider />
          <FlexItem grow>
            <Col gap="s">
              <InfoPanel
                label="ACK time average"
                value={ackTimeAvg}
                suffix="sec"
              />
              <InfoPanel
                label="Records per second average"
                value={recPerSecAvg}
                suffix="/sec"
              />
              <InfoPanel
                label="Read time average"
                value={readTimeAvg}
                suffix="ms"
              />
            </Col>
          </FlexItem>
          <VerticalDivider />
          <FlexItem grow>
            <Row gap="s" align="start">
              <InfoPanel
                label="Total time average"
                value={totalTimeAvg}
                suffix="sec"
              />
            </Row>
          </FlexItem>
        </Row>
      </>
    </Accordion>
  </Panel>
)

export default ProcessingPerformance
