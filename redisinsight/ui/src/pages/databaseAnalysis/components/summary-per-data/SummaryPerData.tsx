import { EuiIcon, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'

import { DonutChart } from 'uiSrc/components/charts'
import { ChartData } from 'uiSrc/components/charts/donut-chart/DonutChart'
import { KeyIconSvg, MemoryIconSvg } from 'uiSrc/components/database-overview/components/icons'
import { GROUP_TYPES_COLORS, GroupTypesColors } from 'uiSrc/constants'
import { formatBytes, getGroupTypeDisplay, Nullable } from 'uiSrc/utils'
import { getPercentage, numberWithSpaces } from 'uiSrc/utils/numbers'

import { DatabaseAnalysis, SimpleTypeSummary } from 'apiSrc/modules/database-analysis/models'

import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
}

const SummaryPerData = ({ data, loading }: Props) => {
  const { totalMemory, totalKeys } = data || {}
  const [memoryData, setMemoryData] = useState<ChartData[]>([])
  const [keysData, setKeysData] = useState<ChartData[]>([])

  const getChartData = (t: SimpleTypeSummary) => ({
    value: t.total,
    name: getGroupTypeDisplay(t.type),
    color: t.type in GROUP_TYPES_COLORS ? GROUP_TYPES_COLORS[t.type as GroupTypesColors] : 'var(--defaultTypeColor)',
    meta: { ...t }
  })

  useEffect(() => {
    if (data) {
      setMemoryData(totalMemory?.types?.map(getChartData) as ChartData[])
      setKeysData(totalKeys?.types?.map(getChartData) as ChartData[])
    }
  }, [data])

  if (loading) {
    return (
      <div className={cx(styles.chartsWrapper, styles.loadingWrapper)} data-testid="summary-per-data-loading">
        <div className={styles.preloaderCircle} />
        <div className={styles.preloaderCircle} />
      </div>
    )
  }

  if ((!totalMemory || memoryData.length === 0) && (!totalKeys || keysData.length === 0)) {
    return null
  }

  const renderMemoryTooltip = (data: ChartData) => (
    <div className={styles.labelTooltip} data-testid="tooltip-memory">
      <b>
        <span className={styles.tooltipKeyType} data-testid="tooltip-key-type">{data.name}: </span>
        <span className={styles.tooltipPercentage} data-testid="tooltip-key-percent">
          {getPercentage(data.value, totalMemory?.total)}%
        </span>
        <span data-testid="tooltip-total-memory">(&thinsp;{formatBytes(data.value, 3, false)}&thinsp;)</span>
      </b>
    </div>
  )

  const renderKeysTooltip = (data: ChartData) => (
    <div className={styles.labelTooltip} data-testid="tooltip-keys">
      <b>
        <span className={styles.tooltipKeyType} data-testid="tooltip-key-type">{data.name}: </span>
        <span className={styles.tooltipPercentage} data-testid="tooltip-key-percent">
          {getPercentage(data.value, totalKeys?.total)}%
        </span>
        <span data-testid="tooltip-total-keys">(&thinsp;{numberWithSpaces(data.value)}&thinsp;)</span>
      </b>
    </div>
  )

  return (
    <div className={styles.wrapper} data-testid="summary-per-data">
      <EuiTitle className="section-title">
        <h4>SUMMARY PER DATA TYPE</h4>
      </EuiTitle>
      <div className={styles.chartsWrapper} data-testid="summary-per-data-charts">
        <DonutChart
          name="memory"
          data={memoryData}
          labelAs="percentage"
          width={432}
          config={{ radius: 94 }}
          renderTooltip={renderMemoryTooltip}
          title={(
            <div className={styles.chartCenter}>
              <div className={styles.chartTitle} data-testid="donut-title-memory">
                <EuiIcon type={MemoryIconSvg} className={styles.icon} size="m" />
                <EuiTitle size="xs">
                  <span>Memory</span>
                </EuiTitle>
              </div>
              <hr className={styles.titleSeparator} />
              <div className={styles.centerCount}>{formatBytes(totalMemory?.total || 0, 3)}</div>
            </div>
          )}
        />
        <DonutChart
          name="keys"
          data={keysData}
          labelAs="percentage"
          width={432}
          config={{ radius: 94 }}
          renderTooltip={renderKeysTooltip}
          title={(
            <div className={styles.chartCenter}>
              <div className={styles.chartTitle} data-testid="donut-title-keys">
                <EuiIcon type={KeyIconSvg} className={styles.icon} size="m" />
                <EuiTitle size="xs">
                  <span>Keys</span>
                </EuiTitle>
              </div>
              <hr className={styles.titleSeparator} />
              <div className={styles.centerCount}>{numberWithSpaces(totalKeys?.total || 0)}</div>
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default SummaryPerData
