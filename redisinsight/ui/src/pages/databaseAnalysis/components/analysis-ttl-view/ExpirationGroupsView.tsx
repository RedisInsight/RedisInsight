import { EuiSwitch, EuiTitle } from '@elastic/eui'

import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { AreaChart } from 'uiSrc/components/charts'
import { AreaChartData, AreaChartDataType, DEFAULT_MULTIPLIER_GRID } from 'uiSrc/components/charts/area-chart/AreaChart'

import { DEFAULT_EXTRAPOLATION, SectionName } from 'uiSrc/pages/databaseAnalysis'
import { dbAnalysisReportsSelector, setShowNoExpiryGroup } from 'uiSrc/slices/analytics/dbAnalysis'
import { extrapolate, formatBytes, formatExtrapolation, Nullable } from 'uiSrc/utils'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import styles from './styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  extrapolation: number
  onSwitchExtrapolation?: (value: boolean, section: SectionName) => void
}

const ExpirationGroupsView = (props: Props) => {
  const { data, loading, extrapolation, onSwitchExtrapolation } = props
  const { totalMemory, totalKeys } = data || {}

  const { showNoExpiryGroup } = useSelector(dbAnalysisReportsSelector)
  const [expirationGroups, setExpirationGroups] = useState<AreaChartData[]>([])
  const [isExtrapolated, setIsExtrapolated] = useState<boolean>(true)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsExtrapolated(extrapolation !== DEFAULT_EXTRAPOLATION)
  }, [extrapolation])

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

    const extrapolationOptions = { apply: isExtrapolated, extrapolation, showPrefix: false }

    setExpirationGroups(
      newExpirationGroups.map(({ total, threshold, label, ...group }) =>
        ({
          ...group,
          y: extrapolate(total, extrapolationOptions) as number,
          x: threshold,
          xlabel: label,
          ylabel: ''
        }))
    )
  }, [data?.expirationGroups, showNoExpiryGroup, isExtrapolated, extrapolation])

  if (loading) {
    return (
      <div className={cx(styles.content, styles.loadingWrapper)} data-testid="summary-per-ttl-loading" />
    )
  }

  const onSwitchChange = (value: boolean) => {
    dispatch(setShowNoExpiryGroup(value))
  }

  if (!data?.expirationGroups?.length || !totalMemory?.total || !totalKeys?.total) {
    return null
  }

  return (
    <div className={cx('section', styles.container)} data-testid="analysis-ttl">
      <div className="section-title-wrapper">
        <div className={styles.titleWrapper}>
          <EuiTitle className="section-title">
            <h4>MEMORY LIKELY TO BE FREED OVER TIME</h4>
          </EuiTitle>
          {extrapolation !== DEFAULT_EXTRAPOLATION && (
            <EuiSwitch
              compressed
              color="subdued"
              className="switch-extrapolate-results"
              label="Extrapolate results"
              checked={isExtrapolated}
              onChange={(e) => {
                setIsExtrapolated(e.target.checked)
                onSwitchExtrapolation?.(e.target.checked, SectionName.MEMORY_LIKELY_TO_BE_FREED)
              }}
              data-testid="extrapolate-results"
            />
          )}
        </div>
        <EuiSwitch
          compressed
          color="subdued"
          className={styles.switch}
          label={<span>Show &quot;No Expiry&quot;</span>}
          checked={showNoExpiryGroup}
          onChange={(e) => onSwitchChange(e.target.checked)}
          data-testid="show-no-expiry-switch"
        />
      </div>
      <div className={cx('section-content', styles.content)}>
        <div className={styles.chart}>
          <AutoSizer>
            {({ width, height }) => (
              <AreaChart
                name="expiration-groups"
                width={width}
                height={height}
                dataType={AreaChartDataType.Bytes}
                divideLastColumn={showNoExpiryGroup}
                multiplierGrid={DEFAULT_MULTIPLIER_GRID}
                data={expirationGroups}
                tooltipValidation={(val) => `${formatExtrapolation(formatBytes(val, 3) as string, isExtrapolated)}`}
                leftAxiosValidation={(val) => formatBytes(val, 1)}
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
