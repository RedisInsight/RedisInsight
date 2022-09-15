import {
  EuiLoadingContent,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { capitalize } from 'lodash'

import {
  truncateNumberToFirstUnit,
  formatLongName,
  truncateNumberToDuration,
} from 'uiSrc/utils'
import { nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType, CONNECTION_TYPE_DISPLAY } from 'uiSrc/slices/interfaces'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { clusterDetailsSelector } from 'uiSrc/slices/analytics/clusterDetails'

import styles from './styles.module.scss'

interface IMetrics {
  label: string
  value: any
  border?: 'left'
}

const MAX_NAME_LENGTH = 30
const DEFAULT_USERNAME = 'Default'

const ClusterDetailsHeader = () => {
  const {
    username = DEFAULT_USERNAME,
    connectionType = ConnectionType.Cluster,
  } = useSelector(connectedInstanceSelector)

  const {
    data,
    loading,
  } = useSelector(clusterDetailsSelector)

  const metrics: IMetrics[] = [{
    label: 'Type',
    value: CONNECTION_TYPE_DISPLAY[connectionType],
  }, {
    label: 'Version',
    value: data?.version || '',
  }, {
    label: 'User',
    value: (username || DEFAULT_USERNAME)?.length < MAX_NAME_LENGTH
      ? (username || DEFAULT_USERNAME)
      : (
        <EuiToolTip
          className={styles.tooltip}
          position="bottom"
          content={(
            <>
              {formatLongName(username || DEFAULT_USERNAME)}
            </>
          )}
        >
          <div data-testid="cluster-details-username">{formatLongName(username || DEFAULT_USERNAME, MAX_NAME_LENGTH, 5)}</div>
        </EuiToolTip>
      ),
  }, {
    label: 'Uptime',
    border: 'left',
    value: (
      <EuiToolTip
        className={styles.tooltip}
        anchorClassName="truncateText"
        position="top"
        content={(
          <>
            {`${nullableNumberWithSpaces(data?.uptimeSec) || 0} s`}
            <br />
            {`(${truncateNumberToDuration(data?.uptimeSec || 0)})`}
          </>
        )}
      >
        <div data-testid="cluster-details-uptime">{truncateNumberToFirstUnit(data?.uptimeSec || 0)}</div>
      </EuiToolTip>
    )
  }]

  return (
    <div className={styles.container} data-testid="cluster-details-header">
      <AnalyticsTabs />

      {loading && !data && (
        <div className={styles.loading} data-testid="cluster-details-loading">
          <EuiLoadingContent lines={2} />
        </div>
      )}
      {data && (
        <div className={cx(styles.content)} data-testid="cluster-details-content">
          {metrics.map(({ value, label, border }) => (
            <div
              className={cx(styles.item, styles[`border${capitalize(border)}`])}
              key={label}
              data-testid={`cluster-details-item-${label}`}
            >
              <EuiText color="subdued" className={styles.value}>{value}</EuiText>
              <EuiText className={styles.label}>{label}</EuiText>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClusterDetailsHeader
