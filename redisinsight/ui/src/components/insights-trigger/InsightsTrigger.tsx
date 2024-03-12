import React, { useEffect } from 'react'
import cx from 'classnames'
import { EuiButton, EuiText, EuiToolTip } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'

import { recommendationsSelector, resetRecommendationsHighlighting } from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { appFeatureHighlightingSelector, removeFeatureFromHighlighting } from 'uiSrc/slices/app/features'
import { getHighlightingFeatures } from 'uiSrc/utils/highlighting'

import styles from './styles.module.scss'

export interface Props {
  source?: string
}

const InsightsTrigger = (props: Props) => {
  const { source = 'overview' } = props
  const { isOpen: isInsigtsOpen, tabSelected } = useSelector(insightsPanelSelector)
  const { isHighlighted, } = useSelector(recommendationsSelector)
  const { provider } = useSelector(connectedInstanceSelector)

  const { features } = useSelector(appFeatureHighlightingSelector)
  const { insights: insightsHighlighting } = getHighlightingFeatures(features)

  const dispatch = useDispatch()
  const { pathname, search } = useLocation()
  const { instanceId } = useParams<{ instanceId: string }>()

  const page = pathname
    .replace(instanceId, '')
    .replace(/^\//g, '')

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const isExploreShouldBeOpened = searchParams.get('insights') === 'open'

    if (isExploreShouldBeOpened) {
      dispatch(toggleInsightsPanel(true))
      dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    }
  }, [search])

  const handleClickTrigger = () => {
    if (isHighlighted) {
      dispatch(resetRecommendationsHighlighting())
      dispatch(changeSelectedTab(InsightsPanelTabs.Recommendations))
    }
    dispatch(toggleInsightsPanel())

    sendEventTelemetry({
      event: isInsigtsOpen ? TelemetryEvent.INSIGHTS_PANEL_CLOSED : TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        provider,
        page,
        source,
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        tab: isHighlighted ? InsightsPanelTabs.Recommendations : tabSelected,
      },
    })

    dispatch(removeFeatureFromHighlighting('insights'))
  }

  return (
    <div
      className={cx(styles.container, { [styles.isOpen]: isInsigtsOpen })}
    >
      <HighlightedFeature
        isHighlight={insightsHighlighting && !isHighlighted}
        hideFirstChild={!isHighlighted}
        {...(BUILD_FEATURES.insights || {})}
      >
        <EuiToolTip
          title={isHighlighted && instanceId ? undefined : 'Insights'}
          content={isHighlighted && instanceId
            ? 'New tips are available'
            : 'Open interactive tutorials to learn more about Redis or Redis Stack capabilities, or use tips to improve your database.'}
        >
          <EuiButton
            fill
            size="s"
            color="secondary"
            className={styles.btn}
            role="button"
            iconType={TriggerIcon}
            onClick={handleClickTrigger}
            data-testid="insights-trigger"
          >
            <EuiText className={cx(
              styles.triggerText,
            )}
            >
              Insights
            </EuiText>
            {(isHighlighted && instanceId) && (<span className={styles.highlighting} />)}
          </EuiButton>
        </EuiToolTip>
      </HighlightedFeature>
    </div>
  )
}

export default InsightsTrigger
