import React, { useCallback, useEffect } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import { appFeatureOnboardingSelector, setOnboardNextStep } from 'uiSrc/slices/app/features'
import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { OnboardingSteps } from 'uiSrc/constants/onboarding'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { analyticsViewTabs } from './constants'

const AnalyticsTabs = () => {
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const connectionType = useConnectionType()
  const { currentStep } = useSelector(appFeatureOnboardingSelector)
  const history = useHistory()

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (connectionType !== ConnectionType.Cluster && currentStep === OnboardingSteps.AnalyticsOverview) {
      dispatch(setOnboardNextStep())
    }
  }, [])

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

    return filteredAnalyticsViewTabs.map(({ id, label, onboard }) => renderOnboardingTourWithChild(
      (
        <EuiTab
          isSelected={viewTab === id}
          onClick={() => onSelectedTabChanged(id)}
          key={id}
          data-testid={`analytics-tab-${id}`}
        >
          {label}
        </EuiTab>
      ),
      { options: onboard, anchorPosition: 'downLeft' },
      viewTab === id,
      id
    ))
  }, [viewTab, connectionType])

  return (
    <>
      <EuiTabs className="tabs-active-borders" data-test-subj="analytics-tabs">{renderTabs()}</EuiTabs>
    </>
  )
}

export default AnalyticsTabs
