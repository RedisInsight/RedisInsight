import React from 'react'
import cx from 'classnames'
import { EuiIcon, EuiText } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'
import { ReactComponent as TriggerActiveIcon } from 'uiSrc/assets/img/bulb-active.svg'

import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import styles from './styles.module.scss'

const InsightsTrigger = () => {
  const { isOpen: isInsigtsOpen } = useSelector(insightsPanelSelector)
  const { isHighlighted, } = useSelector(recommendationsSelector)

  const dispatch = useDispatch()

  const handleClickTrigger = () => {
    if (isHighlighted) {
      dispatch(changeSelectedTab(InsightsPanelTabs.Recommendations))
    }
    dispatch(toggleInsightsPanel())
  }

  return (
    <div
      className={cx(styles.insigtsBtn, { [styles.isOpen]: isInsigtsOpen })}
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
    </div>
  )
}

export default InsightsTrigger
