import React, { useEffect, useState } from 'react'
import { EuiSwitch, EuiText } from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useDispatch, useSelector } from 'react-redux'

import { formatBytes, Nullable } from 'uiSrc/utils'
import { AreaChart } from 'uiSrc/components/charts'
import { DEFAULT_MULTIPLIER_GRID } from 'uiSrc/components/charts/area-chart/AreaChart'
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
  const [expirationGroups, setExpirationGroups] = useState(data?.expirationGroups || [])

  const dispatch = useDispatch()

  useEffect(() => {
    if (!data?.expirationGroups || data?.expirationGroups?.length === 0) {
      return
    }

    const newExpirationGroups = [...(data?.expirationGroups || [])]

    if (showNoExpiryGroup) {
      newExpirationGroups.push(newExpirationGroups.shift())
    } else {
      newExpirationGroups.shift()
    }

    setExpirationGroups(newExpirationGroups)
  }, [data?.expirationGroups, showNoExpiryGroup])

  const onSwitchChange = (value: boolean) => {
    dispatch(setShowNoExpiryGroup(value))
  }

  return (
    expirationGroups.length !== 0 && (
      <div className={styles.container} data-testid="analysis-ttl">
        <EuiText className={styles.title}>MEMORY LIKELY TO BE FREED OVER TIME</EuiText>
        <EuiSwitch
          compressed
          color="subdued"
          className={styles.switch}
          label={<span>Show &quot;No expiry&quot;</span>}
          checked={showNoExpiryGroup}
          onChange={(e) => onSwitchChange(e.target.checked)}
          data-testid="show-no-expiry-switch"
        />
        <div className={styles.content}>
          <AutoSizer>
            {({ width, height }) => (
              <AreaChart
                width={width}
                height={height}
                multiplierGrid={DEFAULT_MULTIPLIER_GRID}
                data={expirationGroups}
                tooltipValidation={(val) => formatBytes(val, 3)}
                leftAxiosValidation={(val, i) => (i % DEFAULT_MULTIPLIER_GRID ? '' : formatBytes(val, 1))}
                bottomAxiosValidation={(_val, i) => (i % DEFAULT_MULTIPLIER_GRID ? '' : expirationGroups[i / DEFAULT_MULTIPLIER_GRID]?.label)}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    )
  )
}

export default ExpirationGroupsView
