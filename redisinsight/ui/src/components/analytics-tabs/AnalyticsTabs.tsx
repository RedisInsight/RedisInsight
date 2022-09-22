import React, { useCallback } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import { analyticsViewTabs } from './constants'

const AnalyticsTabs = () => {
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { connectionType } = useSelector(connectedInstanceSelector)
  const history = useHistory()

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  const onSelectedTabChanged = (id: AnalyticsViewTab) => {
    if (id === AnalyticsViewTab.ClusterDetails) {
      history.push(Pages.clusterDetails(instanceId))
    }
    if (id === AnalyticsViewTab.SlowLog) {
      history.push(Pages.slowLog(instanceId))
    }
    if (id === AnalyticsViewTab.DatabaseAnalysis) {
      history.push(Pages.databaseAnalysis(instanceId))
    }
    dispatch(setAnalyticsViewTab(id))
  }

  const renderTabs = useCallback(() => {
    const filteredAnalyticsViewTabs = connectionType === ConnectionType.Cluster
      ? [...analyticsViewTabs]
      : [...analyticsViewTabs].filter((tab) => tab.id !== AnalyticsViewTab.ClusterDetails)

    return filteredAnalyticsViewTabs.map(({ id, label }) => (
      <EuiTab
        isSelected={viewTab === id}
        onClick={() => onSelectedTabChanged(id)}
        key={id}
        data-testid={`analytics-tab-${id}`}
      >
        {label}
      </EuiTab>
    ))
  }, [viewTab, connectionType])

  return (
    <>
      <EuiTabs className="tabs-active-borders" data-test-subj="analytics-tabs">{renderTabs()}</EuiTabs>
    </>
  )
}

export default AnalyticsTabs
