import { EuiIcon, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { DonutChart } from 'uiSrc/components/charts'
import { ChartData } from 'uiSrc/components/charts/donut-chart/DonutChart'
import { KeyIconSvg, MemoryIconSvg } from 'uiSrc/components/database-overview/components/icons'
import { ModifiedClusterNodes } from 'uiSrc/pages/clusterDetails/ClusterDetailsPage'
import { formatBytes, Nullable } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import styles from './styles.module.scss'

const ClusterDetailsGraphics = ({ nodes, loading }: { nodes: Nullable<ModifiedClusterNodes[]>, loading: boolean }) => {
  const [memoryData, setMemoryData] = useState<ChartData[]>([])
  const [keysData, setKeysData] = useState<ChartData[]>([])

  const renderMemoryLabel = (value: number) => formatBytes(value, 1, false) as string
  const renderMemoryTooltip = (value: number) => `${numberWithSpaces(value)} B`

  useEffect(() => {
    if (nodes) {
      setMemoryData(nodes.map((n) => ({ value: n.usedMemory, name: n.letter, color: n.color })) as ChartData[])
      setKeysData(nodes.map((n) => ({ value: n.totalKeys, name: n.letter, color: n.color })) as ChartData[])
    }
  }, [nodes])

  if (loading && !nodes?.length) {
    return (
      <div className={cx(styles.wrapper, styles.loadingWrapper)} data-testid="cluster-details-graphics-loading">
        <div className={styles.preloaderCircle} />
        <div className={styles.preloaderCircle} />
      </div>
    )
  }

  if (!nodes || nodes.length === 0) {
    return null
  }

  return (
    <div className={styles.wrapper} data-testid="cluster-details-charts">
      <DonutChart
        name="memory"
        data={memoryData}
        renderLabel={renderMemoryLabel}
        renderTooltip={renderMemoryTooltip}
        title={(
          <div className={styles.chartTitle} data-testid="donut-title-memory">
            <EuiIcon type={MemoryIconSvg} className={styles.icon} size="m" />
            <EuiTitle size="xs">
              <span>Memory</span>
            </EuiTitle>
          </div>
        )}
      />
      <DonutChart
        name="keys"
        data={keysData}
        renderTooltip={numberWithSpaces}
        title={(
          <div className={styles.chartTitle} data-testid="donut-title-keys">
            <EuiIcon type={KeyIconSvg} className={styles.icon} size="m" />
            <EuiTitle size="xs">
              <span>Keys</span>
            </EuiTitle>
          </div>
        )}
      />
    </div>
  )
}

export default ClusterDetailsGraphics
