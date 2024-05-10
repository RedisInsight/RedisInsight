import React, { useCallback, useEffect, useState } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Pages, PageValues } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import HighlightedFeature from 'uiSrc/components/hightlighted-feature/HighlightedFeature'
import { getHighlightingFeatures } from 'uiSrc/utils/features'
import { appFeatureHighlightingSelector, removeFeatureFromHighlighting } from 'uiSrc/slices/app/features'
import { tabs } from './constants'

import styles from './styles.module.scss'

const HomeTabs = () => {
  const [activeTab, setActiveTab] = useState('')
  const { features } = useSelector(appFeatureHighlightingSelector)
  const { rdi: rdiHighlighting } = getHighlightingFeatures(features)

  const history = useHistory()
  const { pathname } = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    setActiveTab(pathname.startsWith(Pages.rdi) ? Pages.rdi : Pages.home)
  }, [pathname])

  const onSelectedTabChanged = (path: PageValues, title: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.INSTANCES_TAB_CHANGED,
      eventData: {
        tab: title
      }
    })

    if (path === Pages.rdi) {
      dispatch(removeFeatureFromHighlighting('rdi'))
      history.push(Pages.rdi)
      return
    }

    history.push(Pages.home)
  }

  const renderTabs = useCallback(() => tabs.map(({ id, title, path, featureFlag }) => (
    featureFlag ? (
      <FeatureFlagComponent name={featureFlag} key={id}>
        <EuiTab
          isSelected={path === activeTab}
          onClick={() => onSelectedTabChanged(path, title)}
          className={styles.tab}
          data-testid={`home-tab-${id}`}
        >
          <HighlightedFeature
            isHighlight={rdiHighlighting}
            /* highlighting will remove in next release, do not need cover multiple tabs */
            {...(BUILD_FEATURES.rdi || {})}
          >
            {title}
          </HighlightedFeature>
        </EuiTab>
      </FeatureFlagComponent>
    ) : (
      <EuiTab
        key={id}
        isSelected={path === activeTab}
        onClick={() => onSelectedTabChanged(path, title)}
        className={styles.tab}
        data-testid={`home-tab-${id}`}
      >
        {title}
      </EuiTab>
    )
  )), [activeTab])

  return (<EuiTabs data-testid="home-tabs" className={styles.tabs}>{renderTabs()}</EuiTabs>)
}

export default React.memo(HomeTabs)
