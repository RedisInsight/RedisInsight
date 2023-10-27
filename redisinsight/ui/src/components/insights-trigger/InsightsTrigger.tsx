import React from 'react'
import cx from 'classnames'
import { EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'
import { ReactComponent as TriggerActiveIcon } from 'uiSrc/assets/img/bulb-active.svg'

import { recommendationsSelector, resetRecommendationsHighlighting } from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import styles from './styles.module.scss'

const InsightsTrigger = () => {
  const { isOpen: isInsigtsOpen } = useSelector(insightsPanelSelector)
  const { isHighlighted, } = useSelector(recommendationsSelector)

  const dispatch = useDispatch()

  const handleClickTrigger = () => {
    if (isHighlighted) {
      dispatch(resetRecommendationsHighlighting())
      dispatch(changeSelectedTab(InsightsPanelTabs.Recommendations))
    }
    dispatch(toggleInsightsPanel())
  }

  return (
    <div
      className={cx(styles.insigtsBtn, { [styles.isOpen]: isInsigtsOpen })}
    >
      <EuiToolTip
        title="Insights"
        content="Open interactive tutorials to learn more about Redis or Redis Stack capabilities, or use recommendations to improve your database."
      >
        <div
          className={styles.inner}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          onClick={handleClickTrigger}
          data-testid="insights-trigger"
        >
          <EuiIcon
            type={isHighlighted ? TriggerActiveIcon : TriggerIcon}
            className={styles.triggerIcon}
          />
          <EuiText className={cx(
            styles.triggerText,
          )}
          >
            Insights
          </EuiText>
        </div>
      </EuiToolTip>
    </div>
  )
}

export default InsightsTrigger
