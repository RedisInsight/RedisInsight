import React, { useEffect } from 'react'
import cx from 'classnames'
import { EuiButton, EuiButtonIcon, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'
import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
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

  const TriggerTab = () => (
    <>
      <div
        className={cx(styles.trigger, styles.exploreTrigger, { [styles.isOpen]: isOpen })}
      >
        <div
          className={styles.inner}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          onClick={() => dispatch(toggleInsightsPanel(true))}
          data-testid="explore-trigger"
        >
          <TriggerIcon className={styles.triggerIcon} />
          <EuiText className={cx(
            styles.triggerText,
          )}
          >
            Explore
          </EuiText>
        </div>
      </div>
    </>
  )

  const Tabs = () => (
    <div>
      <EuiButton size="s" onClick={() => handleChangeTab('recommendations')}>Insights</EuiButton>
      <EuiButton size="s" onClick={() => handleChangeTab('explore')} style={{ marginLeft: 10 }}>Explore</EuiButton>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <TriggerTab />
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
              {tabSelected === 'explore' && (<EnablementAreaWrapper />)}
              {tabSelected === 'recommendations' && (<LiveTimeRecommendations />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatabaseSidePanels
