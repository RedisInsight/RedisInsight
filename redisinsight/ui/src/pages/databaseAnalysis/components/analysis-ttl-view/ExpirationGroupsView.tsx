import React, { useEffect, useState } from 'react'
import { EuiSwitch, EuiTitle } from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import { formatBytes, Nullable } from 'uiSrc/utils'
import { AreaChart } from 'uiSrc/components/charts'
import { AreaChartData, DEFAULT_MULTIPLIER_GRID } from 'uiSrc/components/charts/area-chart/AreaChart'
import { DBAnalysisReportsSelector, setShowNoExpiryGroup } from 'uiSrc/slices/analytics/dbAnalysis'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
}

const ExpirationGroupsView = (props: Props) => {
  const { data, loading } = props

  const { showNoExpiryGroup } = useSelector(DBAnalysisReportsSelector)
  const [expirationGroups, setExpirationGroups] = useState<AreaChartData[]>([])

  const dispatch = useDispatch()

  useEffect(() => {
    if (!data?.expirationGroups || data?.expirationGroups?.length === 0) {
      return
    }

    const newExpirationGroups = [...(data?.expirationGroups || [])]

    // move "No expire" column to the end if should be shown
    const noExpireGroup = newExpirationGroups.shift()
    if (showNoExpiryGroup && noExpireGroup && newExpirationGroups.length > 0) {
      newExpirationGroups.push(noExpireGroup)
    }

    setExpirationGroups(
      newExpirationGroups.map(({ total, threshold, label, ...group }) =>
        ({ ...group, y: total, x: threshold, xlabel: label, ylabel: '' }))
    )
  }, [data?.expirationGroups, showNoExpiryGroup])

  if (loading && !data) {
    return (
      <div className={cx(styles.content, styles.loadingWrapper)} data-testid="summary-per-ttl-loading" />
    )
  }

  const onSwitchChange = (value: boolean) => {
    dispatch(setShowNoExpiryGroup(value))
  }

  if (!expirationGroups.length) {
    return null
  }

  return (
    <div className={styles.container} data-testid="analysis-ttl">
      <EuiTitle className="section-title">
        <h4>MEMORY LIKELY TO BE FREED OVER TIME</h4>
      </EuiTitle>
      <div className={styles.content}>
        <EuiSwitch
          compressed
          color="subdued"
          className={styles.switch}
          label={<span>Show &quot;No Expiry&quot;</span>}
          checked={showNoExpiryGroup}
          onChange={(e) => onSwitchChange(e.target.checked)}
          data-testid="show-no-expiry-switch"
        />
        <div className={styles.chart}>
          <AutoSizer>
            {({ width, height }) => (
              <AreaChart
                name="expiration-groups"
                width={width}
                height={height}
                divideLastColumn={showNoExpiryGroup}
                multiplierGrid={DEFAULT_MULTIPLIER_GRID}
                data={expirationGroups}
                tooltipValidation={(val) => formatBytes(val, 3)}
                leftAxiosValidation={(val, i) => (i % DEFAULT_MULTIPLIER_GRID ? '' : formatBytes(val, 1))}
                bottomAxiosValidation={(_val, i) => (i % DEFAULT_MULTIPLIER_GRID ? '' : expirationGroups[i / DEFAULT_MULTIPLIER_GRID]?.xlabel)}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  )
}

export default ExpirationGroupsView
