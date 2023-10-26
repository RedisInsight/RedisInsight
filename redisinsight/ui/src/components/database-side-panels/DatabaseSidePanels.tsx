import React, { useEffect } from 'react'
import cx from 'classnames'
import { EuiButton, EuiButtonIcon } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import LiveTimeRecommendations from './panels/live-time-recommendations'
import EnablementAreaWrapper from './panels/enablement-area'

import styles from './styles.module.scss'

export interface Props {
  panelClassName?: string
}

const DatabaseSidePanels = (props: Props) => {
  const { panelClassName } = props
  const { isOpen, tabSelected } = useSelector(insightsPanelSelector)

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(toggleInsightsPanel(false))
  }

  const handleChangeTab = (name: string) => {
    dispatch(changeSelectedTab(name))
  }

  const Tabs = () => (
    <div>
      <EuiButton size="s" onClick={() => handleChangeTab(InsightsPanelTabs.Recommendations)}>Insights</EuiButton>
      <EuiButton size="s" onClick={() => handleChangeTab(InsightsPanelTabs.Explore)} style={{ marginLeft: 10 }}>Explore</EuiButton>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div
          className={cx(styles.panel, panelClassName)}
          data-testid="insights-panel"
        >
          <div className={styles.panelInner}>
            <div className={styles.header}>
              <Tabs />
              <EuiButtonIcon
                iconSize="m"
                iconType="cross"
                color="primary"
                aria-label="close insights"
                className={styles.closeBtn}
                onClick={handleClose}
                data-testid="close-insights-btn"
              />
            </div>
            <div className={styles.body}>
              {tabSelected === InsightsPanelTabs.Explore && (<EnablementAreaWrapper />)}
              {tabSelected === InsightsPanelTabs.Recommendations && (<LiveTimeRecommendations />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatabaseSidePanels
