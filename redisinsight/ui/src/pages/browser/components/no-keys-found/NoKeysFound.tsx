import React, { useContext } from 'react'
import { EuiTitle, EuiText, EuiSpacer, EuiButton, EuiImage } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { useParams } from 'react-router-dom'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'
import TelescopeDark from 'uiSrc/assets/img/telescope-dark.svg'
import TelescopeLight from 'uiSrc/assets/img/telescope-light.svg'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import styles from './styles.module.scss'

export interface Props {
  onAddKeyPanel: (value: boolean) => void
}

const NoKeysFound = (props: Props) => {
  const { onAddKeyPanel } = props

  const { provider } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  const { instanceId } = useParams<{ instanceId: string }>()
  const { theme } = useContext(ThemeContext)

  const handleOpenInsights = () => {
    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(toggleInsightsPanel(true))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: instanceId,
        provider,
        source: 'browser',
      },
    })
  }

  return (
    <div className={styles.container} data-testid="no-result-found-msg">
      <EuiImage
        className={styles.img}
        src={theme === Theme.Dark ? TelescopeDark : TelescopeLight}
        alt="no results image"
      />
      <EuiSpacer size="l" />
      <EuiText>No Keys to Display</EuiText>
      <EuiSpacer size="m" />
      <EuiTitle className={styles.title} size="s">
        <span>Create your first key to get started</span>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiText>
        Keys are the foundation of Redis.
        <br />
        Create your first key or try our interactive Tutorials to learn how Redis can solve your use cases.
      </EuiText>
      <EuiSpacer size="l" />
      <div className={styles.actions}>
        <EuiButton
          fill
          color="secondary"
          onClick={() => onAddKeyPanel(true)}
          className={styles.addKey}
          data-testid="add-key-msg-btn"
        >
          + Key
        </EuiButton>
        <span>or</span>
        <EuiButton
          color="secondary"
          iconType={TriggerIcon}
          onClick={() => handleOpenInsights()}
          className={styles.exploreBtn}
          data-testid="explore-msg-btn"
        >
          Explore
        </EuiButton>
      </div>
    </div>
  )
}

export default NoKeysFound
