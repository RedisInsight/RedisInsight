import React, { useCallback, useEffect, useState } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { useHistory, useLocation } from 'react-router-dom'
import { Pages, PageValues } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { tabs } from './constants'

import styles from './styles.module.scss'

const HomeTabs = () => {
  const [activeTab, setActiveTab] = useState('')

  const history = useHistory()
  const { pathname } = useLocation()

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
          {title}
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
