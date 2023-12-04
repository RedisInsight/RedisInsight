import React from 'react'
import cx from 'classnames'
import { EuiButton, EuiText, EuiToolTip } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'

import { recommendationsSelector, resetRecommendationsHighlighting } from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import styles from './styles.module.scss'

const InsightsTrigger = () => {
  const { isOpen: isInsigtsOpen, tabSelected } = useSelector(insightsPanelSelector)
  const { isHighlighted, } = useSelector(recommendationsSelector)
  const { provider } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const { instanceId } = useParams<{ instanceId: string }>()

  const page = pathname
    .replace(instanceId, '')
    .replace(/^\//g, '')

  const handleClickTrigger = () => {
    if (isHighlighted) {
      dispatch(resetRecommendationsHighlighting())
      dispatch(changeSelectedTab(InsightsPanelTabs.Recommendations))
    }
    dispatch(toggleInsightsPanel())

    sendEventTelemetry({
      event: isInsigtsOpen ? TelemetryEvent.INSIGHTS_PANEL_CLOSED : TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: instanceId,
        provider,
        page,
        tab: isHighlighted ? InsightsPanelTabs.Recommendations : tabSelected
      },
    })
  }

  return (
    <div
      className={cx(styles.container, { [styles.isOpen]: isInsigtsOpen })}
    >
      <EuiToolTip
        title={isHighlighted ? undefined : 'Insights'}
        content={isHighlighted
          ? 'New recommendations are available'
          : 'Open interactive tutorials to learn more about Redis or Redis Stack capabilities, or use recommendations to improve your database.'}
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
          {isHighlighted && (<span className={styles.highlighting} />)}
        </EuiButton>
      </EuiToolTip>
    </div>
  )
}

export default InsightsTrigger
